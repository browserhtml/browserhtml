/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*:: import * as type from "../../../type/browser/web-view/progress" */

import {Effects, html} from 'reflex';
import {ease, easeOutQuart, float} from 'eased';
import {StyleSheet, Style} from '../../common/style';
import {merge} from '../../common/prelude';
import * as Unknown from '../../common/unknown';

const second = 1000;

export const Start/*:type.Start*/ = time =>
  ( { type: "Start"
    , time
    }
  );

export const Connect/*:type.Connect*/ = time =>
  ( { type: 'Connect'
    , time
    }
  );

export const LoadEnd/*:type.LoadEnd*/ = time =>
  ( { type: "LoadEnd"
    , time
    }
  );

export const Tick/*:type.Tick*/ = time =>
  ( { type: "Tick"
    , time
    }
  );

// Parameters

// Zone A is while connecting (waiting for the server to respond). This can be very fast (especially if server has beeen reached before).
// Zone B is downloading the page and loading it.
// Zone C is when the page is fully loaded and we finish the animation

const limitA = 0.2; // what is the limit for the A zone. It will never reach this point, but tend to it. 1 is 100% of the width
const limitB = 0.9;
const inflectionA = (1 * second); // After how many ms it stops accelerating to slowing approaching the limit
const inflectionB = (2 * second);
const durationC = 200;

const TAU = Math.PI / 2;

const curve = (currentTime, inflectionTime) =>
  (Math.atan((TAU / 2) * (currentTime / inflectionTime)) / TAU);

const progressConnecting = ({loadStart, updateTime}) =>
  limitA * curve(updateTime - loadStart, inflectionA);

const progressLoading = model => {
  const {connectTime, updateTime} = model;
  const padding = progressConnecting(model);
  const toFill = limitB - padding;
  return padding + toFill * curve(updateTime - connectTime, inflectionB);
}

const isConnected = model => model.connectTime;
const isLoaded = model => model.loadEnd;

const progressLoaded = model => {
  const {loadEnd, updateTime} = model;
  const padding = progressLoading(model);
  const toFill = 1 - padding;
  return padding + toFill * (updateTime - loadEnd) / durationC;
}

export const progress/*:type.progress*/ = model =>
  ( model
  ? ( isLoaded(model)
    ? progressLoaded(model)
    : isConnected(model)
    ? progressLoading(model)
    : progressConnecting(model)
    )
  : 0
  );

// Start a new progress cycle.
const start = time =>
  [ { loadStart: time
    , loadEnd: null
    , updateTime: time
    , connectTime: null
    }
  , Effects.tick(Tick)
  ];

const connect = (time, model) =>
  ( [ merge(model, {connectTime: time})
    , Effects.none
    ]
  );

// Invoked on End action and returns model with updated `timeStamp`:
const loadEnd = (time, model) =>
  ( [ merge
      ( model
      , { loadEnd: time
        , updateTime: time
        }
      )
    , Effects.none
    ]
  );

// Update the progress and request another tick.
// Returns a new model and a tick effect.
export const tick/*:type.tick*/ = (time, model) =>
  ( [ merge(model, {updateTime: time})
    , Effects.tick(Tick)
    ]
  );

const end = (time, model) =>
  ( [ model
    , Effects.none
    ]
  );

export const init/*:type.init*/ = () =>
  [null, Effects.none];

export const update/*:type.update*/ = (model, action) =>
  ( action.type === 'Start'
  ? start(action.time)
  : model == null
  ? start(action.time)
  : action.type === 'LoadEnd'
  ? loadEnd(action.time, model)
  : action.type === 'Connect'
  ? connect(action.time, model)
  : action.type === 'Tick' && progress(model) < 1
  ? tick(action.time, model)
  : action.type === 'Tick'
  ? end(action.time, model)
  : Unknown.update(model, action)
  );

const style = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: '27px',
    height: '4px',
    width: '100%'
  },
  // This is the angle that we have at the end of the progress bar
  arrow: {
    width: '4px',
    height: '4px',
    position: 'absolute',
    right: '-4px',
  },
});

// @TODO bring back color theme
export const view/*:type.view*/ = (model) =>
  html.div({
    className: 'progressbar',
    style: Style(style.bar, {
      backgroundColor: '#4A90E2',
      transform: `translateX(${-100 + (100 * progress(model))}%)`,
      visibility: progress(model) < 1 ? 'visible' : 'hidden'
    }),
  }, [html.div({
    className: 'progressbar-arrow',
    style: Style(style.arrow, {
      backgroundImage: 'linear-gradient(135deg, #4A90E2 50%, transparent 50%)',
    })
  })]);

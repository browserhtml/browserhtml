/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*::
import type {Address, DOM} from "reflex"
import type {LoadProgress, Time, Model, Action} from "./progress"
*/

import {Effects, html} from 'reflex';
import {ease, easeOutQuart, float} from 'eased';
import {StyleSheet, Style} from '../../common/style';
import {merge, always} from '../../common/prelude';
import * as Unknown from '../../common/unknown';

const second = 1000;

const NoOp = always({ type: "NoOp" })

export const Start =
  (time/*:Time*/)/*:Action*/ =>
  ( { type: "Start"
    , time
    }
  );

export const Connect =
  (time/*:Time*/)/*:Action*/ =>
  ( { type: 'Connect'
    , time
    }
  );

export const LoadEnd =
  (time/*:Time*/)/*:Action*/ =>
  ( { type: "LoadEnd"
    , time
    }
  );

const Tick =
  (time/*:Time*/)/*:Action*/ =>
  ( { type: "Tick"
    , time
    }
  );

// Parameters

// Zone A is while connecting (waiting for the server to respond). This can be very fast (especially if server has beeen reached before).
// Zone B is downloading the page and loading it.
// Zone C is when the page is fully loaded and we finish the animation

const limitA = 0.2; // what is the limit for the A zone. It will never reach this point, but tend to it. 1 is 100% of the width
const limitB = 0.7;
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

const progressLoaded = model => {
  const {loadEnd, updateTime} = model;
  const padding = progressLoading(model);
  const toFill = 1 - padding;
  return padding + toFill * (updateTime - loadEnd) / durationC;
}

export const progress =
  (model/*:Model*/)/*:LoadProgress*/ =>
  ( model.status === 'Loaded'
  ? progressLoaded(model)
  : model.status === 'Loading'
  ? progressLoading(model)
  : model.status === 'Connecting'
  ? progressConnecting(model)
  : 0 // model.status === 'Idle'
  );

// Start a new progress cycle.
const start = (model, time) =>
  [ merge
    ( model
    , { status: 'Connecting'
      , loadStart: time
      , loadEnd: null
      , updateTime: time
      , connectTime: null
      , display:
        { opacity: 1
        , x: 0
        }
      }
    )
  , Effects.tick(Tick)
  ];

const connect = (model, time) =>
  ( [ merge
      ( model
      , { status: 'Loading'
        , connectTime: time
        }
      )
    , Effects.none
    ]
  );

// Invoked on End action and returns model with updated `timeStamp`:
const loadEnd = (model, time) =>
  ( [ merge
      ( model
      , { status: 'Loaded'
        , loadEnd: time
        , updateTime: time
        }
      )
    , Effects.none
    ]
  );

// Update the progress and request another tick.
// Returns a new model and a tick effect.
const animate = (model, time) =>
  ( [ merge
      ( model
      , { updateTime: time
        , display:
          { opacity: 1
          , x: progress(model) * 100
          }
        }
      )
    , Effects.tick(Tick)
    ]
  );

const end = (model, time) =>
  ( [ merge
      ( model
      , { status: 'Idle'
        , display:
          { opacity: 0
          , x: 0
          }
        }
      )
    , Effects.none
    ]
  );

const tick = (model, time) =>
  ( model.status === 'Idle'
  ? [ model
    , Effects.task
      ( Unknown.warn(`Received Tick when progress was Idle: https://github.com/servo/servo/issues/10322`)
      ).map(NoOp)
    ]
  : progress(model) < 1
  ? animate(model, time)
  : end(model, time)
  )

export const init =
  ()/*:[Model, Effects<Action>]*/ =>
  [ { status: 'Idle'
    , loadStart: null
    , loadEnd: null
    , updateTime: null
    , connectTime: null
    , display:
      { opacity: 0
      , x: 0
      }
    }
  , Effects.none
  ];

export const update =
  (model/*:Model*/, action/*:Action*/)/*:[Model, Effects<Action>]*/ =>
  ( action.type === 'Start'
  ? start(model, action.time)
  : action.type === 'LoadEnd'
  ? loadEnd(model, action.time)
  : action.type === 'Connect'
  ? connect(model, action.time)
  : action.type === 'Tick'
  ? tick(model, action.time)
  : action.type === 'NoOp'
  ? nofx(model)
  : Unknown.update(model, action)
  );

const nofx =
  model =>
  [ model
  , Effects.none
  ]

const style = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: '27px',
    height: '4px',
    width: '100%',
    pointerEvents: 'none'
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
export const view =
  (model/*:Model*/)/*:DOM*/ =>
  html.div({
    className: 'progressbar',
    style: Style(style.bar, {
      backgroundColor: '#4A90E2',
      transform: `translateX(${(model.display.x) - 100}%)`,
      opacity: model.display.opacity
    }),
  }, [html.div({
    className: 'progressbar-arrow',
    style: Style(style.arrow, {
      backgroundImage: 'linear-gradient(135deg, #4A90E2 50%, transparent 50%)',
    })
  })]);

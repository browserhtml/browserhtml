/* @noflow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {merge} from '../../common/prelude';
import * as Result from '../../common/result';
import {Effects, Task} from 'reflex';
import * as Unknown from '../../common/unknown'

/*:: import * as type from "../../../type/browser/web-view/navigation" */



// User interaction interaction may also triggered following actions:
export const Stop/*:type.Stop*/ = {type: "Stop"};
export const Reload/*:type.Reload*/ = {type: "Reload"};
export const GoBack/*:type.GoBack*/ = {type: "GoBack"};
export const GoForward/*:type.GoForward*/ = {type: "GoForward"};

export const Load/*:type.Load*/ = uri =>
  ({type: "Load", uri});

export const LocationChanged/*:type.LocationChanged*/ = uri =>
  ({type: "LocationChanged", uri});

export const CanGoBackChanged/*:type.CanGoBackChanged*/ = result =>
  ({type: "CanGoBackChanged", result});

export const CanGoForwardChanged/*:type.CanGoForwardChanged*/ = result =>
  ({type: "CanGoForwardChanged", result});

export const Stopped/*:type.Stopped*/ = result =>
  ({type: "Stopped", result});

export const Reloaded/*:type.Stopped*/ = result =>
  ({type: "Reloaded", result});

export const WentBack/*:type.WentBack*/ = result =>
  ({type: "WentBack", result});

export const WentForward/*:type.WentBack*/ = result =>
  ({type: "WentForward", result});

export const canGoBack/*:type.canGoBack*/ = id => Task.io(deliver => {
  const target = document.getElementById(`web-view-${id}`);
  if (target == null) {
    deliver(Task.succeed(Result.error(`WebView with id web-view-${id} not found`)))
  }

  else if (target.getCanGoBack == null) {
    deliver(Task.succeed(Result.error(`.getCanGoBack is not supported by runtime`)))
  }

  else {
    target.getCanGoBack().onsuccess = request => {
      deliver(Task.succeed(Result.ok(request.target.result)));
    };
  }
});

export const canGoForward/*:type.canGoForward*/ = id => Task.io(deliver => {
  const target = document.getElementById(`web-view-${id}`);
  if (target == null) {
    deliver(Task.succeed(Result.error(`WebView with id web-view-${id} not found`)))
  }

  else if (target.getCanGoForward == null) {
    deliver(Task.succeed(Result.error(`.getCanGoForward is not supported by runtime`)))
  }

  else {
    target.getCanGoForward().onsuccess = request => {
      deliver(Task.succeed(Result.ok(request.target.result)));
    }
  }
});


const invoke = name => id => Task.io(deliver => {
  const target = document.getElementById(`web-view-${id}`);
  if (target == null) {
    deliver(Task.succeed(Result.error(`WebView with id web-view-${id} not found`)))
  }

  else if (target[name] == null) {
    deliver(Task.succeed(Result.error(`.${name} is not supported by runtime`)))
  }

  else {
    deliver(Task.succeed(Result.ok(void target[name]())));
  }
});

export const stop/*:type.stop*/ = invoke('stop');
export const reload/*:type.reload*/ = invoke('reload');
export const goBack/*:type.goBack*/ = invoke('goBack');
export const goForward/*:type.goForward*/ = invoke('goForward');

const report = error => Task.io(deliver => {
  console.warn(error);
});

export const init/*:type.init*/ = (id, uri) =>
  [ { id
    , canGoBack: false
    , canGoForward: false
    , initiatedURI: uri
    , currentURI: uri
    }
  , Effects.none
  ]

const updateResponse = (model, action) =>
  ( action.result.isOk
  ? [model, Effects.none]
  : [model, Effects.task(report(action.result.error))]
  );

export const update/*:type.update*/ = (model, action) =>
  ( action.type === "CanGoForwardChanged"
  ? ( action.result.isOk
    ? [ merge(model, {canGoForward: action.result.value})
      , Effects.none
      ]
    : [ model, Effects.task(report(action.result.error)) ]
    )
  : action.type === "CanGoBackChanged"
  ? ( action.result.isOk
    ? [ merge(model, {canGoBack: action.result.value})
      , Effects.none
      ]
    : [ model, Effects.task(report(action.result.error)) ]
    )
  : action.type === "LocationChanged"
  ? [ merge(model, {currentURI: action.uri})
    , Effects.batch
      ( [ Effects
            .task(canGoBack(model.id))
            .map(CanGoBackChanged)
        , Effects
            .task(canGoForward(model.id))
            .map(CanGoForwardChanged)
        ]
      )
    ]
  : action.type === "Load"
  ? [ merge
      ( model
      , { initiatedURI: action.uri
        , currentURI: action.uri
        }
      ),
      Effects.none
    ]
  : action.type === "Stop"
  ? [ model
    , Effects
        .task(stop(model.id))
        .map(Stopped)
    ]
  : action.type === "Reload"
  ? [ model
    , Effects
        .task(reload(model.id))
        .map(Reloaded)
    ]
  : action.type === "GoBack"
  ? [ model
    , Effects
        .task(goBack(model.id))
        .map(WentBack)
    ]
  : action.type === "GoForward"
  ? [ model
    , Effects
        .task(goForward(model.id))
        .map(WentForward)
    ]
  : action.type === "Stopped"
  ? updateResponse(model, action)
  : action.type === "Reloaded"
  ? updateResponse(model, action)
  : action.type === "WentBack"
  ? updateResponse(model, action)
  : action.type === "WentForward"
  ? updateResponse(model, action)
  : Unknown.update(model, action)
  );

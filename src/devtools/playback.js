/* @flow */

import {Effects, Task, html, forward} from "reflex"
import {merge} from "../common/prelude"
import {ok, error} from "../common/result"
import * as Runtime from "../common/runtime"
import * as Unknown from "../common/unknown"

/*::
import type {Address, Never, DOM, Init, Update, View, AdvancedConfiguration} from "reflex"
import type {Result} from "../common/result"

export type Model <model> =
  { snapshotURI: string
  , error: ?Error
  , state: ?model
  }

export type Action <model, action> =
  | { type: "Load" }
  | { type: "Target", target: action }
  | { type: "Snapshot", result: Result<Error, model> }

export type PlaybackConfiguration <model, action, flags> =
  AdvancedConfiguration <Model<model>, Action<model, action>, flags>
*/

const Load = { type: "Load" }

const TagTarget = /*::<model, action>*/
  ( target/*:action*/ )/*:Action<model, action>*/ =>
  ( { type: "Target"
    , target
    }
  );

const Snapshot = /*::<model, action>*/
  (result/*:Result<Error, model>*/)/*:Action<model, action>*/ =>
  ( { type: "Snapshot"
    , result
    }
  )


export const playback = /*::<model, action, flags>*/
  ({flags, init, update, view}/*:AdvancedConfiguration<model, action, flags>*/)/*:PlaybackConfiguration<model, action, flags>*/ =>
  ( { flags
    , init: initWith(init)
    , update: updateWith(update)
    , view: viewWith(view)
    }
  )

export const initWith = /*::<model, action, flags>*/
  (init/*:Init<model, action, flags>*/)/*:Init<Model<model>, Action<model, action>, flags>*/ =>
  (flags) =>
  [ { snapshotURI: String(Runtime.env.replay)
    , error: null
    , state: null
    }
  , Effects.receive(Load)
  ]

const updateWith = /*::<model, action>*/
  ( update/*:Update<model, action>*/)/*:Update<Model<model>, Action<model, action>>*/ =>
  ( model, action ) =>
  ( action.type === "Load"
  ? loadSnapshot(model)
  : action.type === "Snapshot"
  ? receiveSnapshot(model, action.result)
  : action.type === "Target"
  ? updateStateWith(update, model, action.target)
  : Unknown.update(model, action)
  )

const updateStateWith = /*::<model, action>*/
  ( update/*:Update<model, action>*/
  , model/*:Model<model>*/
  , action/*:action*/
  )/*:[Model<model>, Effects<Action<model, action>>]*/ => {
    if (model.state == null) {
      throw Error('This should never happen');
    } else {
      const [state, fx] = update(model.state, action);
      return [ merge(model, {state}), fx.map(TagTarget) ];
    }
  }

const receiveSnapshot = /*::<model, action>*/
  (model/*:Model<model>*/, result/*:Result<Error, model>*/)/*:[Model<model>, Effects<Action<model, action>>]*/ =>
  [ ( result.isOk
    ? merge(model, {state: result.value})
    : merge(model, {error: result.error})
    )
  , Effects.none
  ]
const loadSnapshot = /*::<model, action>*/
  (model/*:Model<model>*/)/*:[Model<model>, Effects<Action<model, action>>]*/ =>
  [ model
  , Effects.task(fetchSnapshot(model.snapshotURI))
    .map(Snapshot)
  ]

const fetchSnapshot = /*::<model>*/
  (uri/*:string*/)/*:Task<Never, Result<Error, model>>*/ => new Task(succeed => {
    const request = new XMLHttpRequest();
    request.open
    ( 'GET'
    , uri
    , true
    );


    request.overrideMimeType('application/json');
    request.responseType = 'json';
    request.send();


    request.onload =
      () =>
      succeed
      ( request.status === 200
      ? ok(request.response)
      : request.status === 0
      ? ok(request.response)
      : error(Error(`Failed to fetch ${uri} : ${request.statusText}`))
      )
  });

export const viewWith = /*::<model, action>*/
  ( view /*:View<model, action>*/ )/*:View<Model<model>, Action<model, action>>*/ =>
  ( model, address ) =>
  ( model.error != null
  ? viewError(model.error, address)
  : model.state != null
  ? view(model.state, forward(address, TagTarget))
  : viewFetching(model, address)
  )

const viewError =
  (error, address) =>
  html.main
  ( { className: 'root'
    }
  , [ html.h1
      ( null
      , [ String(error)
        ]
      )
    ]
  )

const viewFetching =
  (model, address) =>
  html.main
  ( { className: 'root'
    }
  , [ html.h1
      ( null
      , [ `Loading snapshot from ${model.snapshotURI}`
        ]
      )
    ]
  )

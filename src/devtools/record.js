/* @flow */

import {Effects, Task, html, forward} from "reflex"
import {merge, always} from "../common/prelude"
import {ok, error} from "../common/result"
import * as Runtime from "../common/runtime"
import * as Unknown from "../common/unknown"

/*::
import type {Address, Never, DOM, Init, Update, View, AdvancedConfiguration} from "reflex"
import type {Result} from "../common/result"
import type {URI, ID} from "../common/prelude"


export type Gist =
  { id: ID
  , url: URI
  , description: String
  , public: boolean
  , files:
    { "snapshot.json":
      { size: number
      , raw_url: URI
      , type: "application/json"
      , language: "JSON"
      , truncated: boolean
      , "content": JSON
      }
    }
  , html_url: URI
  , created_at: String
  , updated_at: String
  }

export type Model <model, action> =
  { status: 'Idle' | 'Pending'
  }

export type Action <model, action> =
  | { type: "NoOp" }
  | { type: "Debuggee", debuggee: action }
  | { type: "PrintSnapshot" }
  | { type: "PublishSnapshot" }
  | { type: "PublishedSnapshot", result: Result<Error, Gist> }

type Step <model, action> =
  [ Model<model, action>
  , Effects<Action<model, action>>
  ]
*/



const NoOp = always({ type: "NoOp" });
const PrintSnapshot = { type: "PrintSnapshot" };
const PublishSnapshot = { type: "PublishSnapshot" };
const PublishedSnapshot = /*::<model, action>*/
  (result/*:Result<Error, Gist>*/)/*:Action<model, action>*/ =>
  ( { type: "PublishedSnapshot"
    , result
    }
  );

export const init = /*::<model, action, flags>*/
  ()/*:Step<model, action>*/ =>
  ( [ { status: "Idle"}
    , Effects.none
    ]
  )

export const update = /*::<model, action>*/
  ( model/*:Model<model, action>*/
  , action/*:Action<model, action>*/
  )/*:Step<model, action>*/ =>
  ( action.type === "NoOp"
  ? nofx(model)
  : action.type === "PrintSnapshot"
  ? printSnapshot(model)
  : action.type === "PublishSnapshot"
  ? publishSnapshot(model)
  : action.type === "PublishedSnapshot"
  ? publishedSnapshot(model, action.result)
  : action.type === "Debuggee"
  ? nofx(model)
  : Unknown.update(model, action)
  )

const nofx =
  model =>
  [ model
  , Effects.none
  ]

const createSnapshot = /*::<model, action>*/
  (model/*:Model<model, action>*/)/*:Task<Error, string>*/ =>
  new Task((succeed, fail) => {
    try {
      succeed(JSON.stringify(window.application.model.value.debuggee))
    }
    catch (error) {
      fail(error)
    }
  })

const printSnapshot = /*::<model, action>*/
  (model/*:Model<model, action>*/)/*:Step<model, action>*/ =>
  [ model
  , Effects.task
    ( createSnapshot(model)
      .chain(snapshot => Unknown.log(`\n\n${snapshot}\n\n`))
      .map(ok)
      .capture(reason => Task.succeed(error(reason)))
    )
    .map(NoOp)
  ]

const publishSnapshot = /*::<model, action>*/
  (model/*:Model<model, action>*/)/*:Step<model, action>*/ =>
  [ merge(model, {status: "Pending"})
  , Effects.task
    ( createSnapshot(model)
      .chain(uploadSnapshot)
      .map(ok)
      .capture(reason => Task.succeed(error(reason)))
    )
    .map(PublishedSnapshot)
  ]

const publishedSnapshot = /*::<model, action>*/
  ( model/*:Model<model, action>*/
  , result/*:Result<Error, Gist>*/
  )/*:Step<model, action>*/ =>
  [ merge(model, {status: "Idle"})
  , Effects.task
    ( result.isError
    ? Unknown.error(result.error)
    : Unknown.log(`Snapshot published as gist #${result.value.id}: ${result.value.html_url}`)
    )
    .map(NoOp)
  ]

const uploadSnapshot =
  (snapshot/*:string*/)/*:Task<Error, Gist>*/ =>
  new Task((succeed, fail) => {
    const request = new XMLHttpRequest({mozSystem: true});
    request.open('POST', 'https://api.github.com/gists', true);
    request.responseType = 'json';
    request.send
    ( JSON.stringify
      ( { "description": "Browser.html generated state snapshot"
        , "public": true
        , "files":
          { "snapshot.json":
            { "content": snapshot }
          }
        }
      )
    );

    request.onload = () =>
    ( request.status === 201
    ? succeed(request.response)
    : fail(Error(`Failed to upload snapshot : ${request.statusText}`))
    )
  });

export const view = /*::<model, action>*/
  ( model/*:Model<model, action>*/
  , address/*:Address<Action<model, action>>*/
  )/*:DOM*/ =>
  html.noscript()

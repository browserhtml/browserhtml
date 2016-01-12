/* @flow */

import type {VirtualTree, Address, Task} from "reflex/type"
import type {Effects, Never} from "reflex/type/effects"
import type {Time, URI} from "../common/prelude"
import type {Result} from "../common/result"

export type Version = String

// # Model

export type Application =
  { updateURI: URI
  , applicationURI: URI
  // eTag is received from the application update server when latest available
  // version info is fetched. It is send back to the server in subsequent
  // requests so that server can respond with - 304 (Not Modified) if no
  // updates are available.
  , eTag: ?string
  // Frequency at which available application updates are requested from the
  // server.
  , pollInterval: Time
  // Date when available version was last checked.
  , lastChecked: ?Time
  // Currently running version. Initially we don't know as we are running
  // in development mode.
  , version: ?Version
  // Latest available version on the host.
  , availableVersion: ?Version
  }

export type Runtime =
  { isUpdateAvailable: boolean
  }



export type Model =
  { application: Application
  , runtime: Runtime
  }

// # Actions

export type ApplyUpdates =
  { type: "ApplyUpdates"
  };

export type CheckApplicationUpdate =
  { type: "CheckApplicationUpdate"
  }

export type CheckRuntimeUpdate =
  { type: "CheckRuntimeUpdate"
  }

export type RuntimeUpdateAvailable =
  { type: 'RuntimeUpdateAvailable'
  }

type ApplicationVersionResult =
  { eTag: ?string
  , pollInterval: ?number
  // If version is `Result.ok(null)` it means that current version
  // is the latest.
  , version: Result<Error, ?Version>
  , time: Time
  }

export type AvailableApplicationVersionFetched =
  { type: 'AvailableApplicationVersionFetched'
  , response: Result<Error, ApplicationVersionResult>
  }


export type ApplicationVersionResponse =
  (eTag:?string, pollInterval:?number, version:Result<Error, Version>, time:Time) =>
  ApplicationVersionResult

export type ApplicationVersionFeteched =
  { type: 'ApplicationVersionFeteched'
  , version: Result<Error, Version>
  }


export type Action
  = CheckRuntimeUpdate
  | CheckApplicationUpdate
  | RuntimeUpdateAvailable
  | ApplicationVersionFeteched
  | AvailableApplicationVersionFetched
  | ApplyUpdates


// IO

export type fetchAvailableApplicationVersion =
  (uri:URI, eTag:?string) =>
  Task<Never, Result<Error, ApplicationVersionResult>>


export type receiveRuntimeUpdateAvailableNotification =
  Task<Never, RuntimeUpdateAvailable>

export type checkRuntimeUpdate =
  Task<Never, void>

export type checkApplicationVersion =
  Task<Never, Result<Error, Version>>

// Update

export type init = (updateURI?:URI) =>
  [Model, Effects<Action>]

export type update = (model:Model, action:Action) =>
  [Model, Effects<Action>]

export const view = (model:Model, address:Address<Action>) =>
  VirtualTree;

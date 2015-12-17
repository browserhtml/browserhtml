/* @flow */

import type {VirtualTree} from "reflex/type"
import type {Effects} from "reflex/type/effects"
import type {Time, URI} from "../common/prelude"
import type {Result} from "../common/result"

export type Model = {
  // eTag is received from the application update server when latest available
  // version info is fetched. It is send back to the server in subsequent
  // requests so that server can respond with - 304 (Not Modified) if no
  // updates are available.
  eTag: ?string,
  // Frequency at which available application updates are requested from the
  // server.
  pollInterval: Time,
  // Currently running application version, it's maybe string because we need
  // to fetch version information during initialization async, so there is a
  // time frame where this is unknown.
  applicationVersion: ?string,
  latestApplicationVersion: ?string,
  updateURI: URI,

  // True if application update is available.
  isApplicationUpdateAvailable: boolean,

  // True if runtime update is available.
  isRuntimeUpdateAvailable: boolean
}

// During initialization updater will create task to inquire running application
// version. If task succeeds this action is triggered as a side effect notifying
// updater about inquired version.
export type ApplicationVersion = {
  type: "Updater.ApplicationVersion",
  version: string
}
export type asApplicationVersion = (version:string) => ApplicationVersion

// Updater will be polling application update server to inquire latest application
// version. This action may be triggered in a side effect notifying updater about
// latest available application version. In addition `eTag` & `pollInterval`
// are also passed to adjust inquiries to match servers demand.
export type LatestApplicationVersion = {
  type: "Updater.LatestApplicationVersionResponse",
  eTag: ?string,
  pollInterval: number,
  version: string
}

export type asLatestApplicationVersion
  = (eTag:?string, pollInterval:number, version:string) => LatestApplicationVersion

// This action is one of the actions that may be triggered in side effect to
// inquiring latest application version. It is triggered when latest application
// version has not changed since last poll.
export type ApplicationUpdateUnavailable = {
  type: "Updater.ApplicationUpdateUnavailable"
}
export type asApplicationUpdateUnavailable = () => ApplicationUpdateUnavailable


// Action is triggered once runtime update becomes available.
export type RuntimeUpdateAvailable = {
  type: "Updater.RuntimeUpdateAvailable"
}
export type asRuntimeUpdateAvailable = () => RuntimeUpdateAvailable


// This action is triggered either by a user or an updater after
// `model.pollInterval` ms has passed since response on last inquiry.
export type CheckApplicationUpdate = {
  type: "Updater.CheckApplicationUpdate"
}
export type asCheckApplicationUpdate = () => CheckApplicationUpdate

// Action is triggerd by a user or by an updater during initialization.
export type CheckRuntimeUpdate = {
  type: "Updater.CheckRuntimeUpdate"
}
export type asCheckRuntimeUpdate = () => CheckRuntimeUpdate

export type Action
  = RuntimeUpdateAvailable
  | CheckApplicationUpdate
  | CheckRuntimeUpdate
  | ApplicationUpdateResponse
  | ApplicationVersionResponse


// IO


export type ApplicationVersionResponse
  = Result<string, ApplicationVersion>

// Creates a task to check if application update is availabe.
export type requestApplicationVersion = () =>
  Effects<ApplicationVersionResponse>

export type ApplicationUpdateResponse
  = Result<string, LatestApplicationVersion|ApplicationUpdateUnavailable>

// Creates a task to check if application update is available.
export type checkApplicationUpdate = (uri:URI, eTag:?string) =>
  Effects<ApplicationUpdateResponse>

// Creates a task that will notify updater once runtime update is available.
export type notifyRuntimeUpdate = () =>
  Effects<RuntimeUpdateAvailable>

// Manually check for runtime update. This task just triggers runtime update
// checker but it does not respond with anything. You should use
// `notifyRuntimeUpdate` to be notified when update is available, that is
// because there is no need to manually check for runtime updates, runtime does
// it on it's own and will tell you when it is available.
export type checkRuntimeUpdate = () =>
  Effects<void>

// This task shedules applicatino update check to be triggered in given
export type scheduleApplicationUpdateCheck = (time:Time) =>
  Effects<CheckApplicationUpdate>


// Livecycle

// During initialization updater schedules several tasks:
// - request to fetch application version
// - request to check application update
// - request to be notified on runtime update
// That is why it can have side effects listed under the a type uninon with in
// the effects.
export type init = () =>
  [Model, Effects<ApplicationVersionResponse |
                  ApplicationUpdateResponse |
                  RuntimeUpdateAvailable>]

// On every action model is updated and additional task maybe requested:
// - request to fetch application version (if that failed during init)
// - request to check an application update (updater polls & user action may also trigger that)
// - request to be notified on runtime update (in response to user action)
// - request to check runtime update (in response to user action)
export type update = (model:Model, action:Action) =>
  [Model, Effects<ApplicationVersionResponse |
                  ApplicationUpdateResponse |
                  RuntimeUpdateAvailable |
                  CheckApplicationUpdate |
                  void>]

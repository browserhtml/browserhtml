/* @flow */

import type {Never} from "reflex/type/effects"
import type {Task} from "reflex/type"
import type {Result} from "../common/result"

// Action is triggered when application JS is hot swapped
export type LiveReload = {
  type: "LiveReload"
}
export type RemoteDebugRequest = {
  type: "RemoteDebugRequest",
}

export type UpdateAvailable = {
  type: "UpdateAvailable",
}

export type UpdateDownloaded = {
  type: "UpdateDownloaded",
}

export type RemoteDebugResponseType = {
  type: "RemoteDebugResponse",
  value: boolean
}

export type RemoteDebugResponse = (value:boolean) => RemoteDebugResponseType

type download = string

export type DownloadUpdateType = {
  type: "DownloadUpdate",
  result: download
}

export type DownloadUpdate = (result: download) => DownloadUpdateType

export type Restart = {
  type: "Restart"
}

export type Reload = {
  type: "Reload"
}

export type CleanRestart = {
  type: "CleanRestart"
}

export type CleanReload = {
  type: "CleanReload"
}


export type Minimized = {
  type: "Minimized"
}

export type FullscreenToggled = {
  type: "FullscreenToggled"
}

export type Quit = {
  type: "Quit"
}


// @TODO: need to be notified when unminimized.

export type never = <result> () => Task<Never, result>

export type respond = <message> (message:message) =>
  Task<Never, message>

export type receive = <type, message> (type:type) =>
  Task<Never, message>

export type send = <message> (request:message) =>
  Task<Never, message>

export type request = <type, request, response>
  (type:type, message:request) =>
  Task<Never, response>

export type quit = Task<Never, Result<Error, void>>;
export type minimize = Task<Never, Result<Error, void>>;
export type toggleFullscreen = Task<Never, Result<Error, void>>;

export type reload = Task<Never, Result<Error, void>>;
export type restart = Task<Never, Result<Error, void>>;

export type cleanReload = Task<Never, Result<Error, void>>;
export type cleanRestart = Task<Never, Result<Error, void>>;

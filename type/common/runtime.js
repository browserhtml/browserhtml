/* @flow */

import type {Never} from "reflex/type/effects"
import type {Task} from "reflex/type"

export type UnknownType <detail> = {
  type: "Unknown",
  detail: detail
}

// Action is triggered when application JS is hot swapped
export type LiveReload = {
  type: "LiveReload"
}

export type Unknown = <detail> (detail:detail) =>
  UnknownType<detail>

export type RemoteDebugRequest = {
  type: "RemoteDebugRequest",
}

export type UpdateAvailable = {
  type: "UpdateAvailable",
}

export type UpdateDownloaded = {
  type: "UpdateDownloaded",
}

export type CheckUpdate = {
  type: "CheckUpdate",
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

export type quit = () => Task<Never, Quit>;
export type minimize = Task<Never, Minimized>;
export type toggleFullscreen = Task<Never, FullscreenToggled>;

export type reload = Task<Never, Reload>;
export type restart = Task<Never, Restart>;

export type cleanReload = Task<Never, CleanReload>;
export type cleanRestart = Task<Never, CleanRestart>;

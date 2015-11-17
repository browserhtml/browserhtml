/* @flow */

export type Unknown = {
  type: "Runtime.Unknown"
}

// Action is triggered when application JS is hot swapped
export type LiveReload = {
  type: "Runtime.LiveReload"
}


export type asUnknown <model> = (state:Unknown<model>) => Unknown<model>

export type RemoteDebugRequest = {
  type: "Runtime.RemoteDebugRequest",
}

export type UpdateAvailable = {
  type: "Runtime.UpdateAvailable",
}

export type UpdateDownloaded = {
  type: "Runtime.UpdateDownloaded",
}

export type CheckUpdate = {
  type: "Runtime.CheckUpdate",
}

export type RemoteDebugResponse = {
  type: "Runtime.RemoteDebugResponse",
  value: boolean
}

export type asRemoteDebugResponse = (value: boolean) => RemoteDebugResponse

type download = string

export type DownloadUpdate = {
  type: "Runtime.DownloadUpdate",
  result: download
}

export type asDownloadUpdate = (result: download) => DownloadUpdate

export type Restart = {
  type: "Runtime.Restart"
}

export type CleanRestart = {
  type: "Runtime.CleanRestart"
}

export type CleanReload = {
  type: "Runtime.CleanReload"
}

export type RequestShutdown = {
  type: "Runtime.RequestShutdown"
}

export type Minimized = {
  type: "Runtime.Minimized"
}

export type FullScreenToggled = {
  type: "Runtime.FullScreenToggled"
}


// @TODO: need to be notified when unminimized.

export type shutdown = () => Effects<void>;
export type minimize = () => Effects<Minimized>;
export type toggleFullScreen = () => Effects<FullScreenToggled>;

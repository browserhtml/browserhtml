/* @flow */

export type Unknown = {
  type: 'Runtime.Unknown',
  // detail: an untyped field that may carry additional information about
  // the unknown action.
};

export type RemoteDebugRequest = {
  type: 'Runtime.RemoteDebugRequest',
};

export type UpdateAvailable = {
  type: 'Runtime.UpdateAvailable',
};

export type UpdateDownloaded = {
  type: 'Runtime.UpdateDownloaded',
};

export type CheckUpdate = {
  type: 'Runtime.CheckUpdate',
};

export type RemoteDebugResponse = {
  type: 'Runtime.RemoteDebugResponse',
  value: boolean
};

type download = string;

export type DownloadUpdate = {
  type: 'Runtime.DownloadUpdate',
  result: download
};

export type Restart = {
  type: 'Runtime.Restart',
};

export type CleanRestart = {
  type: 'Runtime.CleanRestart',
};

export type CleanReload = {
  type: 'Runtime.CleanReload',
};

export type Shutdown = {
  type: 'Runtime.Shutdown',
};

export type Minimize = {
  type: 'Runtime.Minimize',
};

export type Maximize = {
  type: 'Runtime.Maximize',
};

// Action is triggered when application JS is hot swapped
export type LiveReload = {
  type: 'Runtime.LiveReload',
};

export type Action
  = Unknown
  | RemoteDebugRequest
  | UpdateAvailable
  | UpdateDownloaded
  | CheckUpdate
  | RemoteDebugResponse
  | DownloadUpdate
  | Restart
  | CleanRestart
  | Shutdown
  | Minimize
  | Maximize
  | LiveReload;
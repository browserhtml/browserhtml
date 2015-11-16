/* @flow */

export type Unknown = {
  type: 'Runtime.Unknown'
};

export type asUnknown <model> = (state:Unknown<model>) => Unknown<model>;

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

export type asRemoteDebugResponse = (value: boolean) => RemoteDebugResponse;

type download = string;

export type DownloadUpdate = {
  type: 'Runtime.DownloadUpdate',
  result: download
};

export type asDownloadUpdate = (result: download) => DownloadUpdate;

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

export type asShutdown = () => Shutdown;

export type Minimize = {
  type: 'Runtime.Minimize',
};

export type asMinimize = () => Minimize;

export type Maximize = {
  type: 'Runtime.Maximize',
};

export type asMaximize = () => Maximize;

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
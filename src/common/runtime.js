/* @flow */

/*:: import * as type from "../../type/common/runtime" */

// Actions
export const RemoteDebugRequest/*:type.RemoteDebugRequest*/ = {type: 'Runtime.RemoteDebugRequest'};
export const UpdateAvailable/*:type.UpdateAvailable*/ = {type: 'Runtime.UpdateAvailable'};
export const UpdateDownloaded/*:type.UpdateDownloaded*/ = {type: 'Runtime.UpdateDownloaded'};
export const CheckUpdate/*:type.CheckUpdate*/ = {type: 'Runtime.CheckUpdate'};
export const Restart/*:type.Restart*/ = {type: 'Runtime.Restart'};
export const CleanRestart/*:type.CleanRestart*/ = {type: 'Runtime.CleanRestart'};
export const CleanReload/*:type.CleanReload*/ = {type: 'Runtime.CleanReload'};
export const Shutdown/*:type.Shutdown*/ = {type: 'Runtime.Shutdown'};
export const Minimize/*:type.Minimize*/ = {type: 'Runtime.Minimize'};
export const Maximize/*:type.Maximize*/ = {type: 'Runtime.Maximize'};
export const LiveReload/*:type.LiveReload*/ = {type: 'Runtime.LiveReload'};

// Action annotations
export const asUnknown/*:type.asUnknown*/ = detail => ({
  type: 'Runtime.Unknown',
  detail
});

export const asRemoteDebugResponse/*:type.asRemoteDebugResponse*/ = value => ({
  type: 'Runtime.RemoteDebugResponse',
  value
});

export const asDownloadUpdate/*:type.DownloadUpdate*/ = result => ({
  type: 'Runtime.DownloadUpdate',
  result
});

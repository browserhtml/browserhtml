/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


/*:: import * as type from "../../type/common/runtime" */
import {always} from "../common/prelude";
import {Task} from "reflex";

// Actions
export const RemoteDebugRequest/*:type.RemoteDebugRequest*/
  = {type: "RemoteDebugRequest"};

export const UpdateAvailable/*:type.UpdateAvailable*/
  = {type: "UpdateAvailable"};

export const UpdateDownloaded/*:type.UpdateDownloaded*/
  = {type: "UpdateDownloaded"};

export const CheckUpdate/*:type.CheckUpdate*/
  = {type: "CheckUpdate"};

export const Restart/*:type.Restart*/
  = {type: "Restart"};

export const CleanRestart/*:type.CleanRestart*/
  = {type: "CleanRestart"};

export const CleanReload/*:type.CleanReload*/
  = {type: "CleanReload"};

export const Reload/*:type.Reload*/
  = {type: "Reload"};

export const Quit/*:type.Quit*/
  = {type: "Quit"};

export const Minimized/*:type.Minimized*/
  = {type: "Minimized"};

export const FullscreenToggled/*:type.FullscreenToggled*/
  = {type: "FullscreenToggled"};

export const LiveReload/*:type.LiveReload*/
  = {type: "LiveReload"};


// Action annotations
export const Unknown = /*::<detail>*/(detail/*:detail*/)/*:type.UnknownType<detail>*/ =>
  ( { type: "Unknown"
    , detail
    }
  )

export const RemoteDebugResponse/*:type.RemoteDebugResponse*/ = value => ({
  type: "RemoteDebugResponse",
  value
});

export const DownloadUpdate/*:type.DownloadUpdate*/ = result => ({
  type: "DownloadUpdate",
  result
});


const dispatchRequest = data =>
  window.dispatchEvent(new window.CustomEvent("mozContentEvent", {
    bubbles: false,
    cancelable: false,
    detail: data
  }));

export const quit/*:type.quit*/ = Task.io(deliver => {
  dispatchRequest({type: "shutdown-application"});
  // We do not actually close a window but rather we shut down an app, there
  // will be nothing handling a response so we don"t even bother with it.
});


export const minimize/*:type.minimize*/ = Task.future(() => {
  dispatchRequest({type: "minimize-native-window"});
  // We do not get event back when window is minimized so we just pretend
  // that we got it after a tick.
  return Promise.resolve(Minimized);
});

export const toggleFullscreen/*:type.toggleFullscreen*/ = Task.future(() => {
  dispatchRequest({type: "toggle-fullscreen-native-window"});
  // We do not get event back when window is maximized so we just pretend
  // that we got it after a tick.
  return Promise.resolve(FullscreenToggled);
});

export const restart/*:type.restart*/ = Task.io(deliver => {
  console.warn(`Unsupported runtime task "restart" was triggered`);
  dispatchRequest({type: "restart"});
});

export const cleanRestart/*:type.cleanRestart*/ = Task.io(deliver => {
  dispatchRequest({type: "clear-cache-and-restart"});
});

export const cleanReload/*:type.cleanReload*/ = Task.io(deliver => {
  dispatchRequest({type: "clear-cache-and-reload"});
});

export const reload/*:type.reload*/ = Task.io(deliver => {
  try {
    window.location.reload();
  } catch (error) {}
})

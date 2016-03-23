/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


/*::
import * as type from "../../type/common/runtime"
import type {Never} from "reflex/type/effects"

*/
import {always} from "../common/prelude";
import {Task} from "reflex";
import * as OS from '../common/os';
import * as Result from "../common/result";

// Actions
export const RemoteDebugRequest/*:type.RemoteDebugRequest*/
  = {type: "RemoteDebugRequest"};

export const UpdateAvailable/*:type.UpdateAvailable*/
  = {type: "UpdateAvailable"};

export const UpdateDownloaded/*:type.UpdateDownloaded*/
  = {type: "UpdateDownloaded"};

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



export const RemoteDebugResponse/*:type.RemoteDebugResponse*/ = value => ({
  type: "RemoteDebugResponse",
  value
});

export const DownloadUpdate/*:type.DownloadUpdate*/ = result => ({
  type: "DownloadUpdate",
  result
});


export const never/*:Task<Never, any>*/ =
  Task.io(deliver => void(0));

export const respond = /*::<message>*/
  (message/*:message*/)/*:Task<Never, message>*/ =>
  Task.future(() => Promise.resolve(message));

export const send = /*::<message>*/
  (message/*:message*/)/*:Task<Never, void>*/ =>
  Task.io(deliver => {
    window.dispatchEvent(new window.CustomEvent("mozContentEvent", {
      bubbles: true,
      cancelable: false,
      detail: message
    }));

    deliver(Task.succeed(void(0)));
  });

export const receive = /*::<message>*/
  (type/*:string*/)/*:Task<Never, message>*/ =>
  Task.io(deliver => {
    const onMessage = ({detail: message}) => {
      if (message.type === type) {
        window.removeEventListener('mozChromeEvent', onMessage);
        deliver(Task.succeed(message));
      }
    };
    window.addEventListener('mozChromeEvent', onMessage);
  });


export const request = /*::<type, request, response>*/
  (type/*:type*/, message/*:request*/)/*:Task<Never, response>*/ =>
  send(message)
  .chain(always(receive(type)));


export const quit/*:type.quit*/ =
  send({type: "shutdown-application"})
  // We do not actually close a window but rather we shut down an app, there
  // will be nothing handling a response so we don"t even bother with it.
  .chain(always(never));

export const minimize/*:type.minimize*/ =
  send({type: "minimize-native-window"})
  // We do not get event back when window is minimized so we just pretend
  // that we got it after a tick.
  .chain(always(respond(Result.ok(null))));

export const toggleFullscreen/*:type.toggleFullscreen*/ =
  send({type: "toggle-fullscreen-native-window"})
  // We do not get event back when window is maximized so we just pretend
  // that we got it after a tick.
  .chain(always(respond(Result.ok(null))));

export const reload/*:type.reload*/ =
  Task.io(deliver => {
    try {
      window.location.reload();
      deliver(Result.ok(null));
    } catch (error) {
      deliver(Result.error(error));
    }
  });


export const restart/*:type.restart*/ =
  send({type: "restart"})
  .chain(always(respond(Result.error(`Unsupported runtime task "restart" was triggered`))));

export const cleanRestart/*:type.cleanRestart*/ =
  send({type: "clear-cache-and-restart"})
  .chain(always(never));

export const cleanReload/*:type.cleanReload*/ =
  send({type: "clear-cache-and-reload"})
  .chain(always(never));

// This is a temporary measure. Eventually, we want Servo to expose the
// titlebar configuration.
const platform = OS.platform()
export const useNativeTitlebar = _ => platform != "darwin";

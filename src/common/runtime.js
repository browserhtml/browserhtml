/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


/*::
import type {Never} from "reflex"
import type {Result} from "../common/result"
import type {RemoteDebugResponseType, DownloadUpdateType} from "./runtime"

*/
import {always} from "../common/prelude";
import {Task} from "reflex";
import {ok, error} from "../common/result";
import * as OS from '../common/os';

// Actions
export const RemoteDebugRequest
  = {type: "RemoteDebugRequest"};

export const UpdateAvailable
  = {type: "UpdateAvailable"};

export const UpdateDownloaded
  = {type: "UpdateDownloaded"};

export const Restart
  = {type: "Restart"};

export const CleanRestart
  = {type: "CleanRestart"};

export const CleanReload
  = {type: "CleanReload"};

export const Reload
  = {type: "Reload"};

export const Quit
  = {type: "Quit"};

export const Minimized
  = {type: "Minimized"};

export const FullscreenToggled
  = {type: "FullscreenToggled"};



export const RemoteDebugResponse =
  (value/*:boolean*/)/*:RemoteDebugResponseType*/ =>
  ( { type: "RemoteDebugResponse"
    , value
    }
  );

export const DownloadUpdate =
  (result/*:string*/)/*:DownloadUpdateType*/ =>
  ( { type: "DownloadUpdate"
    , result
    }
  );


export const never/*:Task<Never, any>*/ =
  new Task(succeed => void(0));

export const respond = /*::<message>*/
  (message/*:message*/)/*:Task<Never, message>*/ =>
  Task.future(() => Promise.resolve(message));

export const send = /*::<message>*/
  (message/*:message*/)/*:Task<Never, void>*/ =>
  new Task(succeed => {
    window.dispatchEvent(new window.CustomEvent("mozContentEvent", {
      bubbles: true,
      cancelable: false,
      detail: message
    }));

    succeed(void(0));
  });

export const receive = /*::<message>*/
  (type/*:string*/)/*:Task<Never, message>*/ =>
  new Task(succeed => {
    const onMessage = ({detail: message}) => {
      if (message.type === type) {
        window.removeEventListener('mozChromeEvent', onMessage);
        succeed(message);
      }
    };
    window.addEventListener('mozChromeEvent', onMessage);
  });


export const request = /*::<request, response>*/
  (type/*:string*/, message/*:request*/)/*:Task<Never, response>*/ =>
  send(message)
  .chain(always(receive(type)));


export const quit/*:Task<Never, Result<Error, void>>*/ =
  send({type: "shutdown-application"})
  // We do not actually close a window but rather we shut down an app, there
  // will be nothing handling a response so we don"t even bother with it.
  .chain(always(never));

export const minimize/*:Task<Never, Result<Error, void>>*/ =
  send({type: "minimize-native-window"})
  // We do not get event back when window is minimized so we just pretend
  // that we got it after a tick.
  .chain(always(respond(ok())));

export const toggleFullscreen/*:Task<Never, Result<Error, void>>*/ =
  send({type: "toggle-fullscreen-native-window"})
  // We do not get event back when window is maximized so we just pretend
  // that we got it after a tick.
  .chain(always(respond(ok())));

export const reload/*:Task<Never, Result<Error, void>>*/ =
  new Task(succeed => {
    try {
      window.location.reload();
      succeed(ok());
    } catch (e) {
      succeed(error(e));
    }
  });


export const restart/*:Task<Never, Result<Error, void>>*/ =
  send({type: "restart"})
  .chain(always(respond(error(Error(`Unsupported runtime task "restart" was triggered`)))));

export const cleanRestart/*:Task<Never, Result<Error, void>>*/ =
  send({type: "clear-cache-and-restart"})
  .chain(always(never));

export const cleanReload/*:Task<Never, Result<Error, void>>*/ =
  send({type: "clear-cache-and-reload"})
  .chain(always(never));

// This is a temporary measure. Eventually, we want Servo to expose the
// titlebar configuration.
const platform = OS.platform()
export const useNativeTitlebar =
  ()/*:boolean*/ =>
  platform != "darwin";

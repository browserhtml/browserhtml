/* @flow */

import * as Focusable from "../common/focusable";
import * as Target from "../common/target";
import * as Runtime from "../common/runtime";
import {Effects} from "reflex";
import {merge, always} from "../common/prelude";

/*:: import * as type from "../../type/browser/shell" */

export const initial/*:type.Model*/ = {
  isFocused: false,
  isPointerOver: false,
  isMinimized: false,
  isMaximized: false
}

export const RequestClose/*:type.RequestClose*/
  =  {type: "Shell.RequestClose"};

export const RequestMinimize/*:type.RequestMinimize*/
  = {type: "Shell.RequestMinimize"};

export const RequestFullScreenToggle/*:type.RequestMaximize*/
  = {type: "Shell.RequestFullScreenToggle"};


export const asRequestClose/*:type.asRequestClose*/
  = always(RequestClose);
export const asRequestMinimize/*:type.asRequestMinimize*/
  = always(RequestMinimize);
export const asRequestFullScreenToggle/*:type.asRequestMaximize*/
  = always(RequestFullScreenToggle);


export const step/*:type.step*/ = (model, action) =>
  action.type === "Focusable.FocusRequest" ?
    [Focusable.update(model, action), Effects.none] :
  action.type === "Focusable.Focus" ?
    [
      merge(Focusable.update(model, action), {
        isMinimized: false
      }),
      Effects.none
    ] :
  action.type === "Focusable.Blur" ?
    [Focusable.update(model, action), Effects.none] :
  action.type === "Target.Over" ?
    [Target.update(model, action), Effects.none] :
  action.type === "Target.Out" ?
    [Target.update(model, action), Effects.none] :
  action.type === "Runtime.Minimized" ?
    [merge(model, {isMinimized: true}), Effects.none] :
  action.type === "Runtime.FullScreenToggled" ?
    [merge(model, {isMaximized: !model.isMaximized}), Effects.none] :
  action.type === "Shell.RequestClose" ?
    [model, Runtime.shutdown()] :
  action.type === "Shell.RequestMinimize" ?
    [model, Runtime.minimize()] :
  action.type === "Shell.RequestFullScreenToggle" ?
    [model, Runtime.toggleFullScreen()] :
    [model, Effects.none];

/* @flow */

import * as Focusable from "../common/focusable"
import * as Target from "../common/target"

/*:: import * as type from "../../type/browser/shell" */

export const initial/*:type.Model*/ = {
  isFocused: false,
  isPointerOver: false
}


export const update/*:type.update*/ = (model, action) =>
  action.type === "Focusable.FocusRequest" ?
    Focusable.update(model, action) :
  action.type === "Focusable.Focus" ?
    Focusable.update(model, action) :
  action.type === "Focusable.Blur" ?
   Focusable.update(model, action) :
  action.type === "Target.Over" ?
    Target.update(model, action) :
  // action.type === "Target.Out" ?
    Target.update(model, action)

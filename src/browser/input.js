/* @flow */

import * as Focusable from "../common/focusable"
import * as Editable from "../common/editable"

/*:: import * as type from "../../type/browser/input" */

export const initial/*:type.Model*/ = {
  value: "",
  isFocused: false,
  selection: null
}

export const update/*:type.update*/ = (model, action) =>
  action.type === "Focusable.Blur" ?
    Focusable.update(model, action) :
  action.type === "Focusable.Focus" ?
    Focusable.update(model, action) :
  action.type === "Focusable.FocusRequest" ?
    Focusable.update(model, action) :
  action.type === "Editable.Clear" ?
    Editable.update(model, action) :
  action.type === "Editable.Select" ?
    Editable.update(model, action) :
  action.type === "Editable.Change" ?
    Editable.update(model, action) :
    Editable.update(model, action)

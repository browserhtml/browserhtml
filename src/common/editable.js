/* @flow */

import {merge} from "../common/prelude"

/*:: import * as type from "../../type/common/editable" */

export const initial/*:type.Model*/ = {
  value: "",
  selection: null
}

export const asSelect/*:type.asSelect*/ = range =>
  ({type: "Editable.Select", range})

export const asChange/*:type.asChange*/ = (value, selection) =>
  ({type: "Editable.Change", value, selection})

export const Clear/*:type.Clear*/ = {type: "Editable.Clear"}
export const asClear/*:type.asClear*/ = () => Clear

export const select/*:type.select*/ = (model, action) =>
  merge(model, {selection: action.range})

export const change/*:type.change*/ = (model, action) =>
  merge(model, {selection: action.selection, value: action.value})

export const clear/*:type.clear*/ = model =>
  merge(model, initial)

export const update/*:type.update*/ = (model, action) =>
  action.type === "Editable.Clear" ?
    clear(model) :
  action.type === "Editable.Select" ?
    select(model, action) :
  action.type === "Editable.Change" ?
    change(model, action) :
  model;

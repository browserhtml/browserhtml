/* @flow */

import {merge} from "../common/prelude"
import {Effects} from "reflex"

/*:: import * as type from "../../type/common/target" */

export const overState/*:type.Model*/ = {
  isPointerOver: true
}

export const outState/*:type.Model*/ = {
  isPointerOver: false
}

export const initial = outState

export const Over/*:type.Over*/ = {type: "Target.Over"}
export const Out/*:type.Out*/ = {type: "Target.Out"}

export const asOver/*:type.asOver*/ = () => Over
export const asOut/*:type.asOut*/ = () => Out


export const over/*:type.over*/ = model => merge(model, overState)
export const out/*:type.out*/ = model => merge(model, outState)

export const update/*:type.update*/ = (model, action) =>
  action.type == "Target.Over" ?
    over(model) :
  // action.type == "Target.Out" ?
    out(model)

export const step = Effects.nofx(update)

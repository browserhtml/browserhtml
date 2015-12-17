/* @flow */

import {Effects} from "reflex";
import {merge} from "../common/prelude";
import * as Unknown from "../common/unknown";

/*:: import * as type from "../../type/common/target" */

export const Over/*:type.Over*/ = {type: "Over"};
export const Out/*:type.Out*/ = {type: "Out"};

export const update/*:type.update*/ = (model, action) =>
    action.type == "Over"
  ? [merge(model, {isPointerOver: true}), Effects.none]
  : action.type == "Out"
  ? [merge(model, {isPointerOver: false}), Effects.none]
  : Unknown.update(model, action)

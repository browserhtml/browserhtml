/* @flow */

import {merge} from "../common/prelude";
import * as Unknown from "../common/unknown";
import {Effects} from "reflex";

/*:: import * as type from "../../type/common/editable" */

// Actions

export const Clear/*:type.Clear*/ = {type: "Clear"};

export const Select/*:type.Select*/ = range =>
  ({type: "Select", range});

export const Change/*:type.Change*/ = (value, selection) =>
  ({type: "Change", value, selection});



const select = (model, action) =>
  merge(model, {selection: action.range});

const change = (model, action) =>
  merge(model, {selection: action.selection, value: action.value});

const clear = model =>
  merge(model, {value: "", selection: null});

export const update/*:type.update*/ = (model, action) =>
    action.type === "Clear"
  ? [clear(model), Effects.none]
  : action.type === "Select"
  ? [select(model, action), Effects.none]
  : action.type === "Change"
  ? [change(model, action), Effects.none]
  : Unknown.update(model, action);

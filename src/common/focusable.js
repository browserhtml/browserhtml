/* @flow */

import {merge} from "../common/prelude";
import {Effects} from "reflex";

/*:: import * as type from "../../type/common/focusable" */

export const blured/*:type.Model*/ = {isFocused: false};
export const focused/*:type.Model*/ = {isFocused: true};

export const initial = blured;

export const Focus/*:type.Focus*/ = {type:"Focusable.Focus"};
export const Blur/*:type.Blur*/ = {type: "Focusable.Blur"};
export const FocusRequest/*:type.FocusRequest*/ = {type: "Focusable.FocusRequest"};

export const asFocus/*:type.asFocus*/ = () => Focus;
export const asBlur/*:type.asBlur*/ = () => Blur;
export const asFocusRequest/*:type.asFocusRequest*/ = () => FocusRequest;

export const focus/*:type.focus*/ = model => merge(model, focused);
export const blur/*:type.blur*/ = model => merge(model, blured);

export const update/*:type.update*/ = (model, action) =>
  action.type === "Focusable.Focus" ?
    focus(model) :
  action.type === "Focusable.FocusRequest" ?
    focus(model) :
  action.type === "Focusable.Blur" ?
    blur(model) :
  model;

export const step = Effects.nofx(update);

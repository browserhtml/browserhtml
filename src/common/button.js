/* @flow */

import {merge, cursor} from "../common/prelude"
import * as Unknown from "../common/unknown"
import * as Target from "../common/target"
import * as Focusable from "../common/focusable"
import {Style} from "../common/style"
import {html, Effects} from "reflex"

/*:: import * as type from "../../type/common/button" */

export const Down = {type: "Down"}
export const Press = {type: "Press"}
export const Up = {type: "Up"}

const Point = action => ({type: "Point", action});
const Focus = action => ({type: "Focus", action});

const focus = cursor({
  tag: Focus,
  update: Focusable.step
});

const point = cursor({
  tag: Point,
  update: Target.step
});



export const init = () => ({
  isDisabled: false,
  isFocused: false,
  isActive: false,
  isPointerOver: false
});

export const Model = ({isDisabled, isActive, isPointerOver, isFocused}) =>
  ({isDisabled, isActive, isPointerOver});

export const activate = model =>
    model.isDisabled
  ? model
  : merge(model, {isActive: true});

export const deactivate = model =>
    model.isDisabled
  ? model
  : merge(model, {isActive: false});

export const disable = model =>
  merge(model, {isActive: false, isDisabled: true});


export const step = (model, action) =>
    action.type === "Down"
  ? [activate(model), Effects.none]
  : action.type === "Up"
  ? [deactivate(model), Effects.none]
  : action.type === "Press"
  ? [model, Effects.none]
  : action.type === "Point"
  ? point(model, action.action)
  : action.type === "Focus"
  ? focus(model, action.action)
  : Unknown.step(model, action)


export const view = (key, styleSheet) => (model, address, contextStyle) =>
  html.button({
    key: key,
    className: key,
    style: Style
      (   model.isFocused
        ? styleSheet.focused
        : styleSheet.blured

      ,  model.isPointerOver
        ? styleSheet.over
        : styleSheet.out

      ,  model.isActive
        ? styleSheet.active
        : styleSheet.inactive

      ,   model.isDisabled
        ? styleSheet.disabled
        : styleSheet.enabled

      , contextStyle
      ),

    onFocus: () => address(Focus(Focusable.Focus)),
    onBlur: () => address(Focus(Focusable.Blur)),

    onMouseOver: () => address(Point(Target.Over)),
    onMouseOut: () => address(Point(Target.Out)),

    onMouseDown: () => address(Down),
    onClick: () => address(Press),
    onMouseUp: () => address(Up)
  });

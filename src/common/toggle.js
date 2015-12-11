/* @flow */

import {merge, cursor} from "../common/prelude"
import * as Unknown from "../common/unknown"
import * as Target from "../common/target"
import * as Focusable from "../common/focusable"
import * as Button from "../common/button"
import {Style} from "../common/style"
import {html, Effects, Task} from "reflex"

/*:: import * as type from "../../type/common/toggle" */


export const init = () =>
  [
    {
      isDisabled: false,
      isFocused: false,
      isActive: false,
      isPointerOver: false,
      isChecked: false
    },
    Effects.none
  ];


export const Model =
  ({isDisabled, isActive, isPointerOver, isFocused, isChecked}) =>
  ({isDisabled, isActive, isPointerOver, isFocused, isChecked});

export const Press = {type: "Press"};
export const Check = {type: "Check"};
export const Uncheck = {type: "Uncheck"};

const Point = action => ({type: "Point", action});
const Focus = action => ({type: "Focus", action});
const Hold = action => ({type: "Hold", action});

const point = cursor({
  update: Target.step,
  tag: Point
});

const focus = cursor({
  update: Focusable.step,
  tag: Focus
});

const hold = cursor({
  update: Button.step,
  tag: Hold
});


export const step = (model, action) =>
    action.type === "Press"
  ? [   model.isDisabled
      ? model
      : merge(model, {isChecked: !model.isChecked})

    ,   model.isDisabled
      ? Effects.none
      : model.isChecked
      ? Effects.task(Task.succeed(Uncheck))
      : Effects.task(Task.succeed(Check))
    ]

  : action.type === "Check"
  ? [model, Effects.none]
  : action.type === "Uncheck"
  ? [model, Effects.none]

  : action.type === "Hold"
  ? hold(model, action.action)
  : action.type === "Point"
  ? point(model, action.action)
  : action.type === "Focus"
  ? focus(model, action.action)
  : Unknown.step(model, action);


export const view = (key, styleSheet) => (model, address, contextStyle) =>
  html.button({
    key: key,
    className: key,
    style: Style
      (
          styleSheet.base

      ,   model.isFocused
        ? model.focused
        : model.blured

      ,  model.isPointerOver
        ? model.over
        : model.out

      ,  model.isActive
        ? styleSheet.active
        : styleSheet.inactive

      ,   model.isDisabled
        ? styleSheet.disabled
        : styleSheet.enabled

      ,   model.isChecked
        ? styleSheet.checked
        : styleSheet.unchecked

      , contextStyle
      ),

    onFocus: () => address(Focus(Focusable.Focus)),
    onBlur: () => address(Focus(Focusable.Blur)),

    onMouseOver: () => address(Point(Target.Over)),
    onMouseOut: () => address(Point(Target.Out)),

    onMouseDown: () => address(Hold(Button.Down)),
    onMouseUp: () => address(Hold(Button.Up)),

    onClick: () => address(Press),
  });

/* @flow */

import {merge, always} from "../common/prelude"
import {cursor} from "../common/cursor"
import * as Unknown from "../common/unknown"
import * as Target from "../common/target"
import * as Focusable from "../common/focusable"
import * as Button from "../common/button"
import {Style} from "../common/style"
import {html, Effects, forward, Task} from "reflex"

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

const TargetAction = action => ({type: "Target", action});
const FocusableAction = action => ({type: "Focusable", action});
const ButtonAction = action => ({type: "Button", action});

export const Focus = FocusableAction(Focusable.Focus);
export const Blur = FocusableAction(Focusable.Blur);

export const Over = TargetAction(Target.Over);
export const Out = TargetAction(Target.Out);

export const Down = ButtonAction(Button.Down);
export const Up = ButtonAction(Button.Up);


const updateTarget = cursor({
  update: Target.update,
  tag: TargetAction
});

const updateFocusable = cursor({
  update: Focusable.update,
  tag: FocusableAction
});

const updateButton = cursor({
  update: Button.update,
  tag: ButtonAction
});


export const update = (model, action) =>
    action.type === "Press"
  ? [ merge(model, {isChecked: !model.isChecked})
    , ( model.isChecked
      ? Effects.task(Task.succeed(Uncheck))
      : Effects.task(Task.succeed(Check))
      )
    ]

  : action.type === "Check"
  ? [model, Effects.none]
  : action.type === "Uncheck"
  ? [model, Effects.none]

  : action.type === "Button"
  ? updateButton(model, action.action)
  : action.type === "Target"
  ? updateTarget(model, action.action)
  : action.type === "Focusable"
  ? updateFocusable(model, action.action)
  : Unknown.update(model, action);


export const view = (key, styleSheet) => (model, address, contextStyle) =>
  html.button({
    key: key,
    className: key,
    style: Style
      ( styleSheet.base

      ,   model.isFocused
        ? styleSheet.focused
        : styleSheet.blured

      ,   model.isDisabled
        ? styleSheet.disabled
        : styleSheet.enabled


      ,  model.isPointerOver
        ? styleSheet.over
        : styleSheet.out

      ,  model.isActive
        ? styleSheet.active
        : styleSheet.inactive

      ,   model.isChecked
        ? styleSheet.checked
        : styleSheet.unchecked

      , contextStyle
    ),

    onFocus: forward(address, always(Focus)),
    onBlur: forward(address, always(Blur)),

    onMouseOver: forward(address, always(Over)),
    onMouseOut: forward(address, always(Out)),

    onMouseDown: forward(address, always(Down)),
    onMouseUp: forward(address, always(Up)),

    onClick: forward(address, always(Press))
  });

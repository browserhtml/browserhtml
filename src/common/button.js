/* @flow */

import {merge, always} from "../common/prelude"
import {cursor} from "../common/cursor"
import * as Unknown from "../common/unknown"
import * as Target from "../common/target"
import * as Focusable from "../common/focusable"
import {Style} from "../common/style"
import {html, Effects, forward} from "reflex"

/*:: import * as type from "../../type/common/button" */

export const Down = {type: "Down"};
export const Press = {type: "Press"};
export const Up = {type: "Up"};
export const Disable = {type: "Disable"};
export const Enable = {type: "Enable"};

const TargetAction = action => ({type: "Target", action});
const FocusableAction = action => ({type: "Focusable", action});

export const Focus = FocusableAction(Focusable.Focus);
export const Blur = FocusableAction(Focusable.Blur);

export const Over = TargetAction(Target.Over);
export const Out = TargetAction(Target.Out);


const updateFocusable = cursor({
  tag: FocusableAction,
  update: Focusable.update
});

const updateTarget = cursor({
  tag: TargetAction,
  update: Target.update
});


export const init/*:type.init*/ = (isDisabled, isFocused, isActive, isPointerOver, text='') =>
  [ ({isDisabled: false
    , isFocused: false
    , isActive: false
    , isPointerOver: false
    , text
    })
  , Effects.none
  ]

export const Model/*:type.Button*/ = ({isDisabled, isActive, isPointerOver, isFocused}) =>
  ({isDisabled, isActive, isPointerOver, isFocused});

export const update/*:type.update*/ = (model, action) =>
  ( action.type === "Down"
  ? [merge(model, {isActive: true}), Effects.none]
  : action.type === "Up"
  ? [merge(model, {isActive: false}), Effects.none]
  : action.type === "Press"
  ? [model, Effects.none]
  : action.type === "Enable"
  ? [merge(model, {isDisabled: false}), Effects.none]
  : action.type === "Disable"
  ? [merge(model, {isDisabled: true}), Effects.none]
  : action.type === "Target"
  ? updateTarget(model, action.action)
  : action.type === "Focusable"
  ? updateFocusable(model, action.action)
  : Unknown.update(model, action)
  );


export const view/*:type.view*/ = (key, styleSheet) => (model, address, contextStyle) =>
  html.button({
    key: key,
    className: key,
    style: Style
      (  styleSheet.base

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

      , contextStyle
      ),

    onFocus: forward(address, always(Focus)),
    onBlur: forward(address, always(Blur)),

    onMouseOver: forward(address, always(Over)),
    onMouseOut: forward(address, always(Out)),

    onMouseDown: forward(address, always(Down)),
    onClick: forward(address, always(Press)),
    onMouseUp: forward(address, always(Up))
  }, [model.text || '']);

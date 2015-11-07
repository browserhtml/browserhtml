/* @flow */

import * as Editable from "../common/editable"
import * as Focusable from "../common/focusable"

export type Model
  = Focusable.Model
  & Editable.Model


// Workaround for facebook/flow#957
// Flow fails on union of unions there for we manually unpack
// Each union instead of using Focusable.Action | Editable.Action

export type Action
  = Focusable.Focus | Focusable.Blur | Focusable.FocusRequest
  | Editable.Clear | Editable.Select | Editable.Change


export type update = (model:Model, action:Action) => Model

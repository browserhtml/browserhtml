/* @flow */

import * as Editable from "../common/editable"
import * as Focusable from "../common/focusable"

export type Model
  = Focusable.Model
  & Editable.Model

export type Submit = {
  type: 'Input.Submit',
  value: string
};

export type asSubmit = (value: string) => Submit;

// Workaround for facebook/flow#957
// Flow fails on union of unions there for we manually unpack
// Each union instead of using Focusable.Action | Editable.Action

export type Action
  = Submit
  | Focusable.Focus | Focusable.Blur | Focusable.FocusRequest
  | Editable.Clear | Editable.Select | Editable.Change;


export type update = (model:Model, action:Action) => Model;

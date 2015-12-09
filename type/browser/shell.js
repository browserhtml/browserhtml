/* @flow */

import * as Focusable from "../common/focusable"
import * as Target from "../common/target"
import * as Runtime from "../common/runtime"

export type RequestClose = {type: "Shell.RequestClose"}
export type RequestMinimze = {type: "Shell.RequestMinimze"}
export type RequestFullScreenToggle = {type: "Shell.RequestFullScreenToggle"}

export type Mimized = Runtime.Minimized
export type Maximized = Runtime.Maximized


export type Model
  = {isMinimized: boolean, isMaximized: boolean, isClosing: boolean}
  & Focusable.Model
  // Shell is a Target because it keeps track of Window Control hover state.
  // @TODO we may want to break window control state out into its own field.
  & Target.Model

// Workaround for facebook/flow#957
// Flow fails on union of unions there for we manually unpack
// Each union instead of using Focusable.Action | Target.Action

export type Action
  = Focusable.Focus | Focusable.Blur | Focusable.FocusRequest
  | Target.Over | Target.Out
  | RequestClose | RequestMinimze | RequestMinimze
  | Minimized | Maximized

export type Response
  = Minimized | Maximized | void

export type asRequestClose = () => RequestClose
export type asRequestMinimize = () => RequestMinimze
export type asRequestFullScreenToggle = () => RequestFullScreenToggle

export type step = (model:Model, action:Action) => Effects<Response>

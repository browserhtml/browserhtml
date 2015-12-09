/* @flow */

export type KeyCombination = {
  type: "Keyboard.KeyUp"
      | "Keyboard.KeyDown"
      | "Keyboard.KeyPress",
  chord: string,
  key: string,
  metaKey: boolean,
  shiftKey: boolean,
  altKey: boolean,
  ctrlKey: boolean
}

export type BindingTable <Action> = {
  [key:string]: (action:KeyboardEvent) => Action
}

export type bindings = <Action> (table:BindingTable<Action>) =>
  (event:KeyboardEvent) => KeyCombination | Action

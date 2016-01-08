/* @flow */

export type Abort = {
  type: "AbortEvent",
  action: {
    type
      : "KeyUp"
      | "KeyDown"
      | "KeyPress",
    combination: string,
    key: string,
    metaKey: boolean,
    shiftKey: boolean,
    altKey: boolean,
    ctrlKey: boolean
  }
}

export type BindingTable <Action> = {
  [key:string]: (event:KeyboardEvent) => Action
}

export type bindings = <Action> (table:BindingTable<Action>) =>
  (event:KeyboardEvent) => Action | Abort

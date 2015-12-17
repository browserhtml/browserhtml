/* @flow */

import type {Effects} from "reflex/type/effects"


export type Cursor <from, to, in, out> = {
  get: ?(model:from) => to,
  set: ?(model:from, value:to) => from,
  tag: ?(action:in) => out,
  update: (model:to, action:in) => [to, Effects<in>]
}

export type cursor <from, to, in, out>
  = (config:Cursor<from, to, in, out>) =>
    (model:from, action:in) => [from, Effects<out>]

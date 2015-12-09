/* @flow */

/*:: import * as type from "../../type/common/history" */
import {Task, Effects} from "reflex"

export const readTitle/*:type.readTitle*/ = (model, fallback) =>
  model.title ? model.title : fallback;

export const query/*:type.query*/ = (input, limit) =>
  Effects.task(Task.io(deliver => {

  }))

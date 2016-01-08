/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


/*:: import * as type from "../../type/common/history" */
import {Task, Effects} from "reflex"

export const readTitle/*:type.readTitle*/ = (model, fallback) =>
  model.title ? model.title : fallback;

export const query/*:type.query*/ = (input, limit) =>
  Effects.task(Task.io(deliver => {

  }))

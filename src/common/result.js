/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


/*:: import * as Result from "../../type/common/result" */

export const ok = /*::<value>*/(value/*:value*/)/*:Result.Ok<value>*/ =>
  ({isOk: true, isError: false, value});

export const error = /*::<error>*/(error/*:error*/)/*:Result.Error<error>*/ =>
  ({isOk: false, isError: true, error});

/* @flow */

/*:: import * as Result from "../../type/common/result" */

export const ok = /*::<value>*/(value/*:value*/)/*:Result.Ok<value>*/ =>
  ({isOk: true, isError: false, value});

export const error = /*::<error>*/(error/*:error*/)/*:Result.Error<error>*/ =>
  ({isOk: false, isError: true, error});

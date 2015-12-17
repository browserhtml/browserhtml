/* @flow */

export type Ok <value> =
  {isOk: true, isError: false, value:value}

export type Error <error> =
  {isOk: false, isError: true, error:error}

export type ok = <value> (value:value) => Ok<value>
export type result = <error> (error:error) => Error<error>


export type Result <error, value>
  = Ok<value>
  | Error<error>

/* @flow */

import type {Address, VirtualTree} from "reflex/type"
import type {Effects} from "reflex/type/effects"
import type {URI} from "./prelude"


export type Match = {
  type: "Search.Match",
  title: string,
  uri: URI
}

export type asMatch = (title:string) => Match

export type QueryResult = {
  type: "Search.Result",
  query: string,
  matches: Array<Match>
}


// Creates a search query task, when run completion side effect is
// Result action.
export type query = (input:string, limit:number) => Effects<QueryResult>

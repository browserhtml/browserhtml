/* @flow */

import type {Address, VirtualTree} from "reflex/type"
import type {Effects} from "reflex/type/effects"
import type {URI} from "./prelude"

export type PageMatch = {
  type: "History.PageMatch",
  title: ?string,
  uri: URI,
  score: number
}

export type TopHit = {
  type: "History.TopHit",
  title: ?string,
  icon: ?URI,
  uri: URI
}

export type Match
  = TopHit
  | PageMatch

export type QueryResult = {
  type: "History.Result",
  query: string,
  topHit: ?TopHit,
  matches: Array<PageMatch>
}

export type readTitle = (model: Match, fallback: string) => string;

// Creates a search query task, when run completion side effect is
// Result action.
export type query = (input:string, limit:number) => Effects<QueryResult>

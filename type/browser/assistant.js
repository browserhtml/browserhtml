/* @flow */

import type {Address, VirtualTree} from "reflex/type"
import type {Effects} from "reflex/type/effects"
import * as History from "../common/history"
import * as Search from "../common/search"

export type Model = {
  query: string,
  selected: number,

  topHit: ?History.TopHit,
  page: Array<History.PageMatch>,
  search: Array<Search.Match>
}

export type Suggestion
  = History.TopHit
  | History.PageMatch
  | Search.Match

export type SearchMatch = Search.Match
export type PageMatch = History.PageMatch
export type TopHit = History.TopHit
export type Suggestions = Array<Suggestion>

export type countAllSuggestions = (model:Model) => number

export type SuggestionCounts = {topHit:number, page:number, search:number}
export type countSuggestions = (model:Model) => SuggestionCounts


export type selectRelative = (model:Model, offset:number) => Model

export type getAllSuggestions = (model:Model) => Suggestions

export type retainSuggestion
  = <item:Suggestion> (previous:Array<item>, next:Array<item>, suggestion:item, counts:number) => Array<item>

export type retainSelected = (previous:Model, next:Model) => Model

export type Response
  = History.QueryResult
  | Search.QueryResult


export type Query = {
  type: "Assistant.Query",
  input: string
}

export type SelectRelative = {
  type: "Assistant.SelectRelative",
  offset: number
}

export type Unselect = {
  type: "Assistant.Unselect",
}

export type Reset = {
  type: "Assistant.Reset"
}

export type asUnselect = () => Unselect
export type asReset = () => Reset
export type asSelectRelative = (offest:number) => SelectRelative
export type asQuery = (input:string) => Query


export type Action
  = History.QueryResult
  | Search.QueryResult
  | Query
  | SelectRelative
  | Unselect
  | Reset


// Creates a search query task, when run completion side effect is
// Result action.
export type query = (input:string, limit:number) => Effects<Response>


export type update = (model:Model, action:Action) => [Model, Effects<Response>]

/* @flow */

import type {URI, ID} from "../../common/prelude"
import type {Effects} from "reflex/type"
import * as Pallet from "../pallet"

export type Model = {
  uri: URI,
  title: ?string,
  faviconURI: ?URI,
  pallet: Pallet.Model
}

export type ScreenshotUpdate = {
  type: "WebView.Page.ScreenshotUpdate",
  uri: URI,
  image: URI
}

export type CuratedColorUpdate = {
  type: "WebView.Page.CuratedColorUpdate",
  uri: URI,
  color: Pallet.Model
}

export type ColorScraped = {
  type: "WebView.Page.ColorScraped",
  uri: URI,
  color: Pallet.Model
}

export type Response
  = ScreenshotUpdate
  | CuratedColorUpdate
  | ColorScraped



export type DocumentFirstPaint = {type: "WebView.Page.DocumentFirstPaint"}
export type FirstPaint = {type: "WebView.Page.FirstPaint"}
export type MetaChanged = {type: "WebView.Page.MetaChanged"}
export type TitleChanged = {type: "WebView.Page.TitleChanged"}
export type IconChanged = {type: "WebView.Page.IconChanged"}
export type OverflowChanged = {type: "WebView.Page.OverflowChanged"}
export type Scrolled = {type: "WebView.Page.Scrolled"}

export type initialize = (uri:URI) => Model
export type step = (model:Model, action:Action) => [Model, Effects<Response>]

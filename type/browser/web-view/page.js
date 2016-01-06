/* @flow */

import type {URI, ID} from "../../common/prelude"
import type {Effects} from "reflex/type"
import * as Pallet from "../pallet"

export type Icon =
  { href: URI
  , sizes: ?string
  , rel: ?string
  }

export type Model =
  { uri: URI
  , title: ?string
  , faviconURI: ?URI
  , icon: ?Icon

  , themeColor: ?string
  , curatedColor: ?Pallet.Theme

  , pallet: Pallet.Model
  }

export type ScreenshotUpdateType =
  { type: "ScreenshotUpdate"
  , uri: URI
  , image: URI
  }
export type ScreenshotUpdate = (uri:URI, image:URI) =>
  ScreenshotUpdateType

export type CuratedColorUpdate = (color:?Pallet.Theme) =>
    CuratedColorUpdateType

export type CuratedColorUpdateType =
  { type: "CuratedColorUpdate"
  , color: ?Pallet.Theme
  }

export type LoadStart = { type: "LoadStart" }
export type LoadEnd = {type: "LoadEnd"}
export type DocumentFirstPaint = {type: "DocumentFirstPaint"}
export type FirstPaint = {type: "FirstPaint"}
export type CreatePallet = {type: "CreatePallet"}

export type LocationChangedType =
  { type: "LocationChanged"
  , uri: URI
  }
export type LocationChanged = (uri:URI) =>
  LocationChangedType

export type MetaChangedType =
  { type: "MetaChanged"
  , name: string
  , content: string
  }
export type MetaChanged = (name:string, content:string) =>
  MetaChangedType

export type TitleChangedType =
  { type: "TitleChanged"
  , title: string
  }
export type TitleChanged = (title:string) =>
  TitleChangedType

export type IconChangedType =
  { type: "IconChanged"
  , icon: Icon
  }
export type IconChanged = (icon:Icon) =>
  IconChangedType

export type OverflowChangedType =
  { type: "OverflowChanged"
  , isOverflown: boolean
  }
export type OverflowChanged = (isOverflown:boolean) =>
  OverflowChangedType

export type ScrolledType =
  { type: "Scrolled"
  , detail: any
  }
export type Scrolled = (detail:any) =>
  ScrolledType

export type Action
  = DocumentFirstPaint
  | FirstPaint
  | MetaChangedType
  | TitleChangedType
  | IconChangedType
  | OverflowChangedType
  | ScrolledType
  | ScreenshotUpdateType
  | CuratedColorUpdateType
  | CreatePallet
  | LoadStart
  | LoadEnd
  | LocationChanged

export type init = (uri:URI) =>
  [Model, Effects<Action>]

export type update = (model:Model, action:Action) =>
  [Model, Effects<Action>]

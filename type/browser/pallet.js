/* @flow */

import type {URI} from "../../type/common/prelude";
import type {Never, Effects} from "reflex/type/effects";
import type {Task} from "reflex/type";

// Any type of valid CSS color string.
type Color = string;
// A string assumed to be in hex color format.
type HexColor = string;

export type Model =
  { isDark: boolean
  , foreground: ?Color
  , background: ?Color
  }

export type Theme =
  { foreground: Color
  , background: Color
  }

export type isHexBright = (hexcolor: HexColor) =>
  boolean;
export type isDark = (color: Color) =>
  boolean;

export type blank = Model;
export type create = (background: Color, foreground: Color) =>
  Model;

export type requestCuratedColor = (uri:URI) =>
  Task<Never, ?Theme>

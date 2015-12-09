/* @flow */

// Any type of valid CSS color string.
type Color = string;
// A string assumed to be in hex color format.
type HexColor = string;

export type Model = {
  isDark: false,
  foreground: ?Color,
  background: ?Color
}

export type isHexBright = (hexcolor: HexColor) => boolean;
export type isDark = (color: Color) => boolean;

export type blank = Model;
export type initialize = (background: Color, foreground: Color) => Model;

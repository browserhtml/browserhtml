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

export type parseHexColor = (color: Color) => HexColor;

export type isBright = (hexcolor: HexColor) => boolean;

export type initialize = (background: Color, foreground: Color) => Model;

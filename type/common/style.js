/* @flow */

export type Name = string

export type Value
  = string
  | number

export type Selector = string

export type Style =
  { [key:Name]: Value }

export type mix = (...styles:Array<?Style>) =>
  Style

export type StyleSheet =
  { create: <sheet:Sheet> (sheet:sheet) => sheet
  }

export type Sheet =
  {[key:Selector]: ?Style}

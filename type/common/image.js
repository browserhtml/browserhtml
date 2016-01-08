/* @flow */

import {VirtualTree, Address} from "reflex/type";
import {Effects} from "reflex/type/effects";
import {URI} from '../common/prelude';
import {Style} from '../common/style';

export type Model =
  {uri: URI}

export type Image = (data:Model) =>
  Model

export type StyleSheet =
  { base: Style }

export type view =
  (key:string, styleSheet:StyleSheet) =>
  (model:Model, address:Address<any>, contextStyle:?Style) =>
  VirtualTree

/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


import {Effects, html, forward, thunk} from "reflex";
import {merge, always, batch} from "../../common/prelude";
import {Style, StyleSheet} from '../../common/style';

import * as Title from "./title";
import * as Icon from "./icon";
import * as URL from "./url";
import * as Suggestion from "./suggestion";

/*::
import * as Page from "../../../type/browser/assistant/page"
*/


const innerView =
  (model, address) =>
  [ Icon.view(model, '')
  , Title.view(model)
  , URL.view(model)
  ];

export const render/*:Page.view*/ =
  (model, address) =>
  Suggestion.view(model, address, innerView);

export const view/*:Page.view*/ =
  (model, address) =>
  thunk
  ( model.id
  , render
  , model
  , address
  );

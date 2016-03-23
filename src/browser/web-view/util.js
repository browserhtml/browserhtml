/* @noflow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as URI from '../../common/url-helper';
import * as Favicon from '../../common/favicon';

/*::
import * as Util from "./util"
*/

export const readTitle/*:Util.readTitle*/ = (model, fallback) =>
 ( (model.page && model.page.title && model.page.title !== '')
 ? model.page.title
 : model.navigation.currentURI.search(/^\s*$/)
 ? URI.prettify(model.navigation.currentURI)
 : fallback
 );

export const readFaviconURI/*:Util.readFaviconURI*/ =
  (model) =>
  ( (model.page && model.page.faviconURI)
  ? model.page.faviconURI
  : Favicon.getFallback(model.navigation.currentURI)
  );

export const isDark/*:Util.isDark*/ = (model) =>
 ( model.page
 ? model.page.pallet.isDark
 : false
 );

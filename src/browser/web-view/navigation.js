/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*:: import * as type from "../../type/browser/web-view/navigation" */

import {merge} from '../../lang/object';
import type {Effects} from "reflex/type/effects"

// User interaction interaction may also triggered following actions:
export const Stop/*:type.Stop*/ = {type: "WebView.Navigation.Stop"};
export const Reload/*:type.Reload*/ = {type: "WebView.Navigation.Reload"};
export const GoBack/*:type.GoBack*/ = {type: "WebView.Navigation.GoBack"};
export const GoForward/*:type.GoForward*/ = {type: "WebView.Navigation.GoForward"};

// @TODO IO

export const initiate/*:type.initiate*/ = (uri) => ({
  canGoBack: false,
  canGoForward: false,
  initiatedURI: uri,
  currentURI: uri
});

const asLoad/*:type.asLoad*/ = uri =>
  ({type: "WebView.Navigation.Load", uri});

export const load/*:type.load*/ = (model, uri) =>
  merge(model, {initiatedURI: uri, currentURI: uri});

export const changeLocation/*:type.changeLocation*/ = (model, uri) =>
  merge(model, {currentURI: uri});

// @TODO step

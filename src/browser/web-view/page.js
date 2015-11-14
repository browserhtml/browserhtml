/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*:: import * as type from "../../type/browser/web-view/page" */

export const DocumentFirstPaint/*:type.DocumentFirstPaint*/ = {
  type: "WebView.Page.DocumentFirstPaint"
};

export const FirstPaint/*:type.FirstPaint*/ = {
  type: "WebView.Page.FirstPaint"
};

export const MetaChanged/*:type.MetaChanged*/ = {
  type: "WebView.Page.MetaChanged"
};

export const TitleChanged/*:type.TitleChanged*/ = {
  type: "WebView.Page.TitleChanged"
};

export const IconChanged/*:type.IconChanged*/ = {
  type: "WebView.Page.IconChanged"
};

export const OverflowChanged/*:type.OverflowChanged*/ = {
  type: "WebView.Page.OverflowChanged"
};

export const Scrolled/*:type.Scrolled*/ = {
  type: "WebView.Page.Scrolled"
};

export const initialize/*:type.initialize*/ = uri => ({
  uri: uri,
  title: null,
  faviconURI: null,
  pallet: {isDark: false}
});

// @TODO step

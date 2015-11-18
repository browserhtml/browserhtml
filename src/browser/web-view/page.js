/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*:: import * as type from "../../type/browser/web-view/page" */

import {Effects} from 'reflex';

export const DocumentFirstPaint/*:type.DocumentFirstPaint*/ = {
  type: "WebView.Page.DocumentFirstPaint"
};

export const FirstPaint/*:type.FirstPaint*/ = {
  type: "WebView.Page.FirstPaint"
};

export const MetaChanged/*:type.MetaChanged*/ = {
  type: "WebView.Page.MetaChanged"
};

// @TODO are we supposed to get a title in the event?
export const TitleChanged/*:type.TitleChanged*/ = {
  type: "WebView.Page.TitleChanged"
};

// @TODO are we supposed to get an icon url in the event?
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

export const step/*:type.step*/ = (model, action) =>
  // @TODO not sure what to do with this one... do we need it?
  // action.type === 'WebView.Page.ScreenshotUpdate' ?
  action.type === 'WebView.Page.CuratedColorUpdate' ?
    [merge(model, {pallet: action.pallet}), Effects.none] :
  action.type === 'WebView.Page.ColorScraped' ?
    [merge(model, {pallet: action.pallet}), Effects.none] :
  // @TODO what do we do with these?
  // action.type === 'WebView.Page.DocumentFirstPaint' ?
  // action.type === 'WebView.Page.FirstPaint' ?
  // action.type === 'WebView.Page.MetaChanged' ?
  // action.type === 'WebView.Page.TitleChanged' ?
  // action.type === 'WebView.Page.IconChanged' ?
  // action.type === 'WebView.Page.OverflowChanged' ?
  // action.type === 'WebView.Page.Scrolled' ?
  [model, Effects.none];

export const readTitle/*:type.readTitle*/ = (model) =>
  // @TODO clean up URI and remove protocol stuff
  model.title && model.title !== '' ? model.title : model.uri;

/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*:: import * as type from "../../type/browser/web-view/page" */

import {Effects} from 'reflex';
import {merge} from '../../common/prelude';
import * as Favicon from '../../common/favicon';
import * as Pallet from '../../browser/pallet';

export const DocumentFirstPaint/*:type.DocumentFirstPaint*/ = {
  type: "WebView.Page.DocumentFirstPaint"
};

export const FirstPaint/*:type.FirstPaint*/ = {
  type: "WebView.Page.FirstPaint"
};

export const asMetaChanged/*:type.asMetaChanged*/ = (name, content) =>
  ({type: "WebView.Page.MetaChanged", name, content});


export const asTitleChanged/*:type.asTitleChanged*/ = title =>
 ({type: "WebView.Page.TitleChanged", title});

export const asIconChanged/*:type.asIconChanged*/ = icon =>
  ({type: "WebView.Page.IconChanged", icon});

export const asOverflowChanged/*:type.asOverflowChanged*/ = isOverflown =>
  ({type: "WebView.Page.OverflowChanged", isOverflown});

export const asScrolled/*:type.asScrolled*/ = detail =>
  ({type: "WebView.Page.Scrolled", detail});

export const initiate/*:type.initiate*/ = uri => ({
  uri,
  title: null,
  icon: null,
  faviconURI: null,
  themeColor: null,
  curatedColor: null,
  pallet: Pallet.blank
});

export const start/*:type.start*/ = Effects.nofx(model => merge(model, {
  title: null,
  icon: null,
  faviconURI: null,
  themeColor: null,
  curatedColor: null
}));

export const changeLocation/*:type.changeLocation*/ = (model, uri) =>
  [merge(model, {uri}), Pallet.requestCuratedColor(uri)];


const updateIcon = (model, icon) => {
  const {bestIcon, faviconURI} = Favicon.getBestIcon([model.icon, icon]);
  return merge(model, {
    icon: bestIcon,
    faviconURI: faviconURI
  });
};

const updateMeta = (model, name, content) =>
  name === 'theme-color' ?
    merge(model, {themeColor: content}) :
    model;

const updatePallet = model =>
  model.curatedColor ?
    merge(model, {
      pallet: Pallet.initialize(model.curatedColor.background,
                                model.curatedColor.foreground)
    }) :
  model.themeColor ?
    merge(model, {
      pallet: Pallet.initialize(...`${model.themeColor}|'`.split('|'))
    }) :
  merge(model, {
    pallet: Pallet.blank
  });

export const step/*:type.step*/ = (model, action) =>
  action.type === 'WebView.Progress.LoadStart' ?
    start(model) :
  action.type === 'WebView.Page.TitleChanged' ?
    [merge(model, {title: action.title}), Effects.none] :
  action.type === 'WebView.Page.IconChanged' ?
    [updateIcon(model, action.icon), Effects.none] :
  action.type === 'WebView.Page.MetaChanged' ?
    [updateMeta(model, action.name, action.content), Effects.none] :
  action.type === 'WebView.Page.ColorScraped' ?
    [model, Effects.none] :
  action.type === 'WebView.Page.CuratedColorUpdate' ?
    [merge(model, {curatedColor: action.color}), Effects.none] :
  action.type === 'WebView.Page.ScreenshotUpdate' ?
    [model, Effects.none] :
  action.type === 'WebView.Page.DocumentFirstPaint' ?
    [updatePallet(model), Effects.none] :
  action.type === 'WebView.Page.FirstPaint' ?
    [model, Effects.none] :
  action.type === 'WebView.Page.OverflowChanged' ?
    [model, Effects.none] :
  action.type === 'WebView.Page.Scrolled' ?
    [model, Effects.none] :
  // @TODO: Right now if you go back or forward we do not get LoadStart event
  // which means non of the
  action.type === 'WebView.LocationChanged' ?
    changeLocation(model, action.uri) :
    [model, Effects.none];

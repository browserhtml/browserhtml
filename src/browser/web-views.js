/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*:: import * as type from "../../type/browser/web-views" */

import {html} from 'reflex';
import * as WebView from './web-view';
import {Style, StyleSheet} from '../common/style';

const style = StyleSheet.create({
  webviews: {
    height: '100vh',
    left: 0,
    overflow: 'hidden', // necessary to clip the radius
    position: 'absolute', // to position webviews relatively to stack
    top: 0,
    width: '100vw',
    willChange: 'transform',
    xBorderRadius: '4px', // WARNING: will slow down animations! (gecko)
  }
});

export const view/*:type.view*/ = (model, address) =>
  html.div({
    className: 'webview-stack',
    style: Style(style.webviews)
  }, model.entries.map(model => WebView.view(model, address)));
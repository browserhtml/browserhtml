/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Effects, html} from 'reflex';
import {merge} from '../common/prelude';
import {Style, StyleSheet} from '../common/style';

/*:: import * as type from "../../type/browser/overlay" */

export const shown/*:type.Model*/ = {opacity: 1};
export const hidden/*:type.Model*/ = {opacity: 0};
export const initial/*:type.Model*/ = hidden;

export const Show/*:type.Show*/ = {type: 'Overlay.Show'};
export const Hide/*:type.Hide*/ = {type: 'Overlay.Hide'};

export const show/*:type.show*/ = model => merge(model, shown);
export const hide/*:type.hide*/ = model => merge(model, hidden);

export const update/*:type.update*/ = (model, action) =>
  action.type === 'Overlay.Show' ?
    show(model) :
  action.type === 'Overlay.Hide' ?
    hide(model) :
  model;

export const step = Effects.nofx(update);

const style = StyleSheet.create({
  overlay: {
    background: 'rgba(39, 51, 64, 0.1)',
    position: 'absolute',
    width: '100vw',
    height: '100vh'
  }
});

export const view = ({opacity}, address, modeStyle) =>
  html.div({
    className: 'overlay',
    style: Style(style.overlay, {
      opacity,
      pointerEvents: opacity < 100 ? 'none' : 'all'
    })
  });
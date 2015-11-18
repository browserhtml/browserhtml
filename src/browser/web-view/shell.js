/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*:: import * as type from "../../type/browser/web-view/shell" */

import * as Focusable from "../../common/focusable"

export const ZoomIn/*:type.ZoomIn*/ = {type: "WebView.Shell.ZoomIn"};
export const ZoomOut/*:type.ZoomOut*/ = {type: "WebView.Shell.ZoomOut"};
export const ResetZoom/*:type.ResetZoom*/ = {type: "WebView.Shell.ResetZoom"};

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;

export const initial = ({
  isFocused: false,
  isVisible: false,
  zoom: 1
})

export const resetZoom/*:type.resetZoom*/ = (model) =>
  merge(model, {zoom: 1});

export const zoomIn/*:type.zoomIn*/ = (model) =>
  merge(model, {zoom: Math.min(ZOOM_MAX, model.zoom + ZOOM_STEP)});

export const zoomOut/*:type.zoomOut*/ = (model) =>
  merge(model, {zoom: Math.max(ZOOM_MIN, model.zoom - ZOOM_STEP)});

export const updateVisibility/*:type.updateVisibility*/ = (value, model) =>
  merge(model, {isVisible: value});

export const update/*:type.update*/ = (model, action) =>
  action.type === 'WebView.Shell.VisibilityChanged' ?
    updateVisibility(action.value, model) :
  action.type === 'WebView.Shell.ZoomIn' ?
    zoomIn(model) :
  action.type === 'WebView.Shell.ZoomOut' ?
    zoomOut(model) :
  action.type === 'WebView.Shell.ResetZoom' ?
    resetZoom(model) :
  action.type === 'Focusable.Focus' ?
    Focusable.update(model, action) :
  action.type === 'Focusable.FocusRequest' ?
    Focusable.update(model, action) :
  action.type === 'Focusable.Blur' ?
    Focusable.update(model, action) :
  // @TODO Do we need to handle Loader.Load?
  model;

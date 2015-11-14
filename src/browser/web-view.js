/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*:: import * as type from "../../type/browser/web-view" */

import {Effects} from 'reflex';
import {updateIn, stepIn} from '../common/lang/object';
import * as Shell from './web-view/shell';
import * as Progress from './web-view/progress';
// @TODO navigation
import * as Security from './web-view/security';
import * as Page from './web-view/page';

export const step/*:type.step*/ (model, action) =>
  // Shell actions
  action.type === "Focusable.FocusRequest" ?
    [updateIn('shell', Shell.update, model, action), Effects.none] :
  action.type === "Focusable.Focus" ?
    [updateIn('shell', Shell.update, model, action), Effects.none] :
  action.type === "Focusable.Blur" ?
    [updateIn('shell', Shell.update, model, action), Effects.none] :
  action.type === "Target.Over" ?
    [updateIn('shell', Shell.update, model, action), Effects.none] :
  action.type === "Target.Out" ?
    [updateIn('shell', Shell.update, model, action), Effects.none] :

  // Progress actions
  action.type === 'WebView.Progress.Start' ?
    stepIn('progress', Progress.update, model, action) :
  action.type === 'WebView.Progress.End' ?
    stepIn('progress', Progress.update, model, action) :
  action.type === 'WebView.Progress.Tick' ?
    stepIn('progress', Progress.update, model, action) :
  // @TODO navigation

  // Security actions
  action.type === 'WebView.Security.Changed' ?
    [updateIn('security', Security.update, model, action), Effects.none] :

  // Page actions
  action.type === 'WebView.Page.ScreenshotUpdate' ?
    stepIn('page', Page.step, model, action) :
  action.type === 'WebView.Page.CuratedColorUpdate' ?
    stepIn('page', Page.step, model, action) :
  action.type === 'WebView.Page.ColorScraped' ?
    stepIn('page', Page.step, model, action) :
  action.type === 'WebView.Page.DocumentFirstPaint' ?
    stepIn('page', Page.step, model, action) :
  action.type === 'WebView.Page.FirstPaint' ?
    stepIn('page', Page.step, model, action) :
  action.type === 'WebView.Page.MetaChanged' ?
    stepIn('page', Page.step, model, action) :
  action.type === 'WebView.Page.TitleChanged' ?
    stepIn('page', Page.step, model, action) :
  action.type === 'WebView.Page.IconChanged' ?
    stepIn('page', Page.step, model, action) :
  action.type === 'WebView.Page.OverflowChanged' ?
    stepIn('page', Page.step, model, action) :
  action.type === 'WebView.Page.Scrolled' ?
    stepIn('page', Page.step, model, action) :

  // Default
  [model, Effects.none];
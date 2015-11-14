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
// @TODO page

export const step/*:type.step*/ (model, action) =>
  // Shell actions
  // @TODO hook up response effects.
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
  action.type === 'WebView.Progress.Start' ?
    stepIn('progress', Progress.update, model, action) :
  action.type === 'WebView.Progress.End' ?
    stepIn('progress', Progress.update, model, action) :
  action.type === 'WebView.Progress.Tick' ?
    stepIn('progress', Progress.update, model, action) :
  // @TODO navigation
  action.type === 'WebView.Security.Changed' ?
    [updateIn('security', Security.update, model, action), Effects.none] :
  // @TODO page
  [model, Effects.none];
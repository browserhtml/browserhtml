/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*:: import * as type from "../../type/browser/web-view/security" */

export const asChanged = (state, extendedValidation) => ({
  type: "WebView.Security.Changed",
  state,
  extendedValidation,
});

export const initial/*:type.initial*/ = {
  state: 'insecure',
  secure: false,
  extendedValidation: false,
};

export const update/*:type.update*/ = (model, action) =>
  action.type === 'WebView.Security.Changed' ?
    {
      state: action.state,
      secure: action.state === 'secure',
      extendedValidation: action.extendedValidation,
    } :
  model;

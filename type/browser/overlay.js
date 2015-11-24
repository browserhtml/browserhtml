/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type Model = {
  opacity: number
};

export type Show = {
  type: 'Overlay.Show'
};

export type Hide = {
  type: 'Overlay.Hide'
};

export type Action
  = Show
  | Hide;

export type show = (model:Model) => Model;
export type hide = (model:Model) => Model;
export type update = (model:Model, action:Action) => Model;
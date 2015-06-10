/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const {Record, Union, List, Maybe, Any} = require('common/typed');

  // Model


  const Model = Record({
    title: Maybe(String),
    icon: Maybe(String),
    overflow: false,
  });
  exports.Model = Model;

  // Action

  const MetaChange = Record({
    id: String,
  }, 'WebView.MetaChange');

  const TitleChange = Record({
    id: String,
    title: String
  }, 'WebView.Page.TitleChange');

  const IconChange = Record({
    id: String,
    uri: String
  }, 'WebView.Page.IconChange');

  const Scroll = Record({
    id: String
  }, 'WebView.Page.Scroll');

  const OverflowChange = Record({
    id: String,
    overflow: Boolean
  }, 'WebView.Page.OverflowChange');


  const Action = Union({TitleChange, IconChange, MetaChange,
                        Scroll, OverflowChange});
  exports.Action = Action;


  // Update

  const update = (state, action) =>
    state instanceof TitleChange ? state.set('title', action.title) :
    state instanceof IconChange ? state.set('icon', action.uri) :
    action instanceof OverflowChange ? state.set('overflow', action.overflow) :
    state;

  exports.update = update;


});

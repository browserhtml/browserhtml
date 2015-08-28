/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  'use strict';

  const {Record, Union, List, Maybe, Any} = require('typed-immutable');
  const URI = require('../common/url-helper');

  // Model
  const Model = Record({
    id: String,
    opener: Any,
    uri: Maybe(String),
    src: Maybe(String)
  }, 'WebLoader');
  exports.Model = Model;

  // Actions

  const Load = Record({
    description: 'Request loading of the passed `uri`',
    uri: String
  }, 'WebView.Load');
  exports.Load = Load;

  const LocationChanged = Record({
    description: 'Location of the web view changed to enclosed uri',
    uri: String,
    timeStamp: Number
  }, 'WebView.LocationChanged');
  exports.LocationChanged = LocationChanged;

  const Action = Union(Load, LocationChanged);
  exports.Action = Action;

  // Update

  const update = (state, action) =>
    action instanceof Load ? state.merge({
      src: action.uri,
      uri: action.uri
    }) :
    action instanceof LocationChanged ?
      state.set('uri', action.uri) :
    state;
  exports.update = update;

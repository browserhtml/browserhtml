/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  'use strict';

  const {Record, Union, List, Maybe, Any} = require('typed-immutable');
  const Loader = require('./web-loader');
  const Progress = require('./web-progress');

  // Actions

  const CanGoBackChanged = Record({
    description: 'Navigator state for going forward changed',
    value: Boolean
  }, 'WebView.Navigation.CanGoBackChanged');
  exports.CanGoBackChanged = CanGoBackChanged;

  const CanGoForwardChanged = Record({
    description: 'Navigator state for going back changed',
    value: Boolean
  }, 'WebView.Navigation.CanGoForwardChanged');
  exports.CanGoForwardChanged = CanGoForwardChanged;


  const GoBack = Record({
    description: 'Navigate web-view back'
  },'WebView.Navigation.GoBack');
  GoBack.Task = class {
    run(node) {
      if (node.goBack) {
        node.goBack();
      }
    }
  };
  exports.GoBack = GoBack;

  const GoForward = Record({
    description: 'Navigate web-view forward'
  }, 'WebView.Navigation.GoForward');
  GoForward.Task = class {
    run(node) {
      if (node.goForward) {
        node.goForward();
      }
    }
  };
  exports.GoForward = GoForward;

  const Stop = Record({
    description: 'Interupt web-view navigation'
  }, 'WebView.Navigation.Stop');
  Stop.Task = class {
    run(node) {
      if (node.stop) {
        node.stop();
      }
    }
  };
  exports.Stop = Stop;

  const Reload = Record({
    description: 'Reload web-view'
  },  'WebView.Navigation.Reload');
  Reload.Task = class {
    run(node) {
      if (node.reload) {
        node.reload();
      }
    }
  };
  exports.Reload = Reload;

  const Action = Union(CanGoBackChanged, CanGoForwardChanged,
                       Stop, Reload, GoBack, GoForward);
  exports.Action = Action;

  // Model

  const Model = Record({
    canGoBack: false,
    canGoForward: false,
    task: Any
  });
  exports.Model = Model;


  // Update

  const update = (state, action) =>
    action instanceof CanGoBackChanged ?
      state.set('canGoBack', action.value) :
    action instanceof CanGoForwardChanged ?
      state.set('canGoForward', action.value) :
    action instanceof GoBack ?
      state.set('task', new GoBack.Task()) :
    action instanceof GoForward ?
      state.set('task', new GoForward.Task()) :
    action instanceof Stop ?
      state.set('task', new Stop.Task()) :
    action instanceof Reload ?
      state.set('task', new Reload.Task()) :
    action instanceof Loader.LocationChanged ?
      state.set('task', null) :
    action instanceof Progress.LoadStarted ?
      state.clear() :
    action instanceof Loader.Load ?
      state.clear() :
    state;

  exports.update = update;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const {Record, Union} = require('typed-immutable/index');
  const {html, render} = require('reflex')
  const ClassSet = require('common/class-set');
  const {mix} = require('common/style');

  const Progress = require('./progress-bar');
  const WindowControls = require('./window-controls');
  const LocationBar = require('./location-bar');

  const Theme = require('./theme');
  const WebView = require('./web-view');

  // Model

  const NavigationPanelStyle = Record({
    backgroundColor: 'inherit',
    MozWindowDragging: 'drag',
    padding: 10,
    position: 'relative',
    scrollSnapCoordinate: '0 0',
    transition: 'background-color 200ms ease',
    textAlign: 'center'
  });

  const WindowBar = Record({
    isFocused: Boolean
  }, 'WindowBar');

  // Action
  const {Enter, Exit, Select, Change, Preview,
         Submit, SuggestNext, SuggestPrevious} = LocationBar.Action;
  const Action = Union(Enter, Exit, Select, Change);
  Action.Preview = Preview;
  Action.SuggestNext = SuggestNext;
  Action.SuggestPrevious = SuggestPrevious;
  Action.Submit = Submit;

  WindowBar.Action = Action;
  // Update


  // view

  WindowBar.view = (shell, webView, theme, address) => html.div({
    key: 'WindowBar',
    style: NavigationPanelStyle(theme.navigationPanel),
    className: ClassSet({
      navbar: true,
      cangoback: webView.navigation.canGoBack,
      canreload: webView.page.uri,
      loading: webView.progress.value < 1,
      ssl: webView.security.state == 'secure',
      sslv: webView.security.extendedValidation,
    })
  }, [
    render('WindowControls', WindowControls.view, shell, theme, address),
    render('LocationBar', LocationBar.view, webView, theme, address),
    render('ProgressBar', Progress.view,
           webView.progress, webView.id, theme, address)
  ]);

  module.exports = WindowBar;
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const {DOM} = require('react')
  const Component = require('omniscient');
  const {isPrivileged} = require('common/url-helper');
  const ClassSet = require('common/class-set');
  const {webViewssBar} = require('./progress-bar');
  const {WindowControls} = require('./window-controls');
  const {LocationBar} = require('./location-bar');



  const WindowBar = Component(function WindowBar(state, handlers) {
    const {key, input, tabStrip, webView, suggestions,
           title, rfa, theme, isDocumentFocused} = state;
    return DOM.div({
      key,
      style: theme.navigationPanel,
      className: ClassSet({
        navbar: true,
        urledit: input.get('isFocused'),
        cangoback: webView.canGoBack,
        canreload: webView.uri,
        loading: webView.isLoading,
        ssl: webView.securityState == 'secure',
        sslv: webView.securityExtendedValidation,
        privileged: isPrivileged(webView.uri)
      })
    }, [
      WindowControls({
        key: 'WindowControls',
        isDocumentFocused,
        theme
      }),
      LocationBar.render(LocationBar({
        key: 'navigation',
        input, tabStrip, webView,
        suggestions, title, theme
      }), handlers),
      ProgressBar({key: 'progressbar', rfa, webView, theme},
                  {editRfa: handlers.editRfa}),
      DOM.div({key: 'spacer', className: 'freeendspacer'})
    ])
  });

  // Exports:

  exports.WindowBar = WindowBar;

});

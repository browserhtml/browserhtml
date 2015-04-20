/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const Component = require('omniscient');
  const {DOM} = require('react');
  const {sendEventToChrome} = require('./actions');
  const {mix} = require('common/style');

  const styleContainer = {
    alignItems: 'center',
    flexShrink: 0,
    marginLeft: 7
  };

  const styleButton = {
    width: 12,
    height: 12,
    marginRight: 8,
    borderRadius: '50%'
  };

  const styleGreyButton = mix({
    backgroundColor: 'hsl(0, 0%, 86%)'
  }, styleButton);

  const WindowControls = Component(({isDocumentFocused, windowControls, theme}) => {

    const styleMinButton = mix(theme.windowMinButton, styleButton);
    const styleMaxButton = mix(theme.windowMaxButton, styleButton);
    const styleCloseButton = mix(theme.windowCloseButton, styleButton);

    return DOM.div({
      key: 'WindowControlsContainer',
      style: styleContainer,
    }, [
      DOM.div({
        key: 'WindowCloseButton',
        style: isDocumentFocused ? styleCloseButton : styleGreyButton,
        onClick: e => sendEventToChrome('shutdown-application')
      }),
      DOM.div({
        key: 'WindowMinButton',
        style: isDocumentFocused ? styleMinButton : styleGreyButton,
        onClick: e => sendEventToChrome('minimize-native-window')
      }),
      DOM.div({
        key: 'WindowMaxButton',
        style: isDocumentFocused ? styleMaxButton : styleGreyButton,
        onClick: e => sendEventToChrome('toggle-fullscreen-native-window')
      })
    ])
  });

  exports.WindowControls = WindowControls;

});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  'use strict';

  const {html, forward} = require('reflex');
  const {Style, StyleSheet} = require('../common/style');
  const Runtime = require('../common/runtime');

  // style

  const styleButton = StyleSheet.create({
    button: {
      backgroundPosition: '0 0',
      backgroundRepeat: 'no-repeat',
      // Scale sprite by 1/2 for retina.
      backgroundSize: '12px auto',
      borderRadius: '50%',
      borderWidth: '0.5px',
      borderStyle: 'solid',
      width: '12px',
      height: '12px',
      left: 0,
      position: 'absolute',
      top: 0
    },
    close: {
      backgroundColor: '#fc635e',
      borderColor: '#e03932',
      left: 0
    },
    min: {
      backgroundPosition: '0 -50px',
      backgroundColor: '#fdc242',
      borderColor: '#df9b08',
      left: '20px'
    },
    max: {
      backgroundPosition: '0 -100px',
      backgroundColor: '#35cc4b',
      borderColor: '#28ab36',
      left: '40px'
    },
    unfocused: {
      backgroundColor: '#ddd',
      borderColor: '#d3d3d3'
    },
    light: {
      backgroundImage: 'url(css/window-controls-light.sprite.png)',
    },
    dark: {
      backgroundImage: 'url(css/window-controls-dark.sprite.png)'
    }
  });

  const styleContainer = StyleSheet.create({
    container: {
      height: '12px',
      position: 'absolute',
      width: '50px',
      top: '8px',
      left: '8px',
      zIndex: 200
    },
    light: {
    },
    dark: {
    }
  });

  // Style


  const view = ({isFocused}, theme, address) => html.div({
    key: 'window-controls',
    className: 'window-controls',
    style: styleContainer.container,
  }, [
    html.button({
      key: 'WindowCloseButton',
      style: Style(styleButton.button,
                   styleButton.close,
                   theme.isDark ? styleButton.dark : styleButton.light),
      onClick: forward(address, Runtime.Shutdown)
    }),
    html.button({
      key: 'WindowMinButton',
      className: 'button minimize',
      style: Style(styleButton.button,
                   styleButton.min,
                   theme.isDark ? styleButton.dark : styleButton.light),
      onClick: forward(address, Runtime.Minimize)
    }),
    html.button({
      key: 'WindowMaxButton',
      className: 'button maximize',
      style: Style(styleButton.button,
                   styleButton.max,
                   theme.isDark ? styleButton.dark : styleButton.light),
      onClick: forward(address, Runtime.Maximize)
    })
  ]);
  exports.view = view;

/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {html, forward} from 'reflex';
import {on} from 'driver';
import {asFor} from "../common/prelude";
import {Style, StyleSheet} from '../common/style';
import * as Target from '../common/target';
import * as Shell from '../browser/shell';
/*:: import * as type from '../../type/browser/window-controls' */

// style

const styleButton = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    backgroundImage: 'url(css/window-controls.sprite.png)',
    backgroundRepeat: 'no-repeat',
    // Scale sprite by 1/2 for retina.
    backgroundSize: '25px auto',
    width: '12px',
    height: '12px',
    left: 0,
    position: 'absolute',
    top: 0
  },
  close: {
    backgroundPosition: '0 -150px',
    left: 0
  },
  min: {
    backgroundPosition: '0 -200px',
    left: '20px'
  },
  max: {
    backgroundPosition: '0 -250px',
    left: '40px'
  },
  hoverClose: {
    backgroundPosition: '0 0',
  },
  hoverMin: {
    backgroundPosition: '0 -50px',
  },
  hoverMax: {
    backgroundPosition: '0 -100px',
  },
  unfocused: {
    backgroundPosition: '0 -300px'
  },
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
});

export const view/*:type.view*/ = ({isFocused, isPointerOver}, address) =>
  html.div({
    key: 'window-controls',
    className: 'window-controls',
    style: styleContainer.container,
    onMouseOver: forward(address, Target.asOver),
    onMouseOut: forward(address, Target.asOut),
  }, [
    html.button({
      key: 'WindowCloseButton',
      style: Style(styleButton.button,
                   styleButton.close,
                   !isFocused && styleButton.unfocused,
                   isPointerOver && styleButton.hoverClose),
      onClick: forward(address, Shell.asRequestClose),
    }),
    html.button({
      key: 'WindowMinButton',
      className: 'button minimize',
      style: Style(styleButton.button,
                   styleButton.min,
                   !isFocused && styleButton.unfocused,
                   isPointerOver && styleButton.hoverMin),
      onClick: forward(address, Shell.asRequestMinimize),
    }),
    html.button({
      key: 'WindowMaxButton',
      className: 'button maximize',
      style: Style(styleButton.button,
                   styleButton.max,
                   !isFocused && styleButton.unfocused,
                   isPointerOver && styleButton.hoverMax),
      onClick: forward(address, Shell.asRequestFullScreenToggle)
    })
  ]);

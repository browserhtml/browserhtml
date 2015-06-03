/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const {Record, Maybe, Union} = require('typed-immutable/index');
  const {html} = require('reflex');
  const Embedding = require('common/embedding');

  // Model

  const Color = String;

  const ButtonStyle = Record({
    backgroundColor: Maybe(Color),
    display: 'inline-block',
    width: 12,
    height: 12,
    marginRight: 8,
    borderRadius: '50%'
  });

  const WindowTheme = Record({
    minButton: ButtonStyle({
      backgroundColor: '#FDBC40'
    }),
    maxButton: ButtonStyle({
      backgroundColor: '#33C748'
    }),
    closeButton: ButtonStyle({
      backgroundColor: '#FC5753'
    })
  });

  const WindowControls = Record({
    id: 'WindowControls',
    theme: WindowTheme,
    isFocused: true
  });

  // Actions

  const {SystemAction} = Embedding;
  const Action = Union(SystemAction);
  Action.SystemAction = SystemAction;

  WindowControls.Action = Action;

  // Update

  // WindowControls only produces `SystemActions` and handling of those
  // are delegated to Embedding.
  WindowControls.update = (state, action) =>
    action.constructor === SystemAction ? Embedding.update(state, action) :
    state;

  // View

  const containerStyle = {
    position: 'absolute',
    top: 10,
    left: 10,
    lineHeight: '30px',
    verticalAlign: 'center',
    marginLeft: 7,
  };

  const unfocusedButton = ButtonStyle({
    backgroundColor: 'hsl(0, 0%, 86%)'
  });

  // Helper functions for triggering system actions. Defined here to avoid
  // unecessary allocations on every render.
  const close = _ => SystemAction({type: 'shutdown-application'});
  const minimize = _ => SystemAction({type: 'minimize-native-window'});
  const maximize = _ => SystemAction({type: 'toggle-fullscreen-native-window'});


  WindowControls.view = ({id, isFocused, theme}) => html.div({
    key: id,
    style: containerStyle
  }, [
    html.div({
      key: 'WindowCloseButton',
      style: isFocused ? theme.closeButton : unfocusedButton,
      onClick: close
    }),
    html.div({
      key: 'WindowMinButton',
      style: isFocused ? theme.minButton : unfocusedButton,
      onClick: minimize
    }),
    html.div({
      key: 'WindowMaxButton',
      style: isFocused ? theme.maxButton : unfocusedButton,
      onClick: maximize
    })
  ]);

  module.exports = WindowControls;
});

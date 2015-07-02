/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const {Record, Union, Maybe} = require('common/typed');
  const {html, render} = require('reflex')
  const ClassSet = require('common/class-set');
  const {mix} = require('common/style');

  const WindowControls = require('./window-controls');
  const Preview = require('./web-preview');
  const Theme = require('./theme');

  // Model

  const NavigationPanelStyle = Record({
    backgroundColor: 'inherit',
    color: 'inherit',
    MozWindowDragging: 'drag',
    transition: 'background-color 300ms ease, color 300ms ease',
    textAlign: 'center',
    position: 'relative',
    zIndex: 2,
    visibility: Maybe(String)
  });


  // view

  const view = (isActive, id, shell, theme, address) => html.div({
    key: 'WindowBar',
    style: NavigationPanelStyle({
      backgroundColor: theme.shell,
      color: theme.shellText,
      visibility: (id && isActive) ? 'visible' : 'hidden'
    }),
    className: ClassSet({
      navbar: true,
    })
  }, [
    html.div({
      key: 'header',
      style: {
        boxShadow:theme.isDark ?
          '0 1px 0 rgba(255, 255, 255, 0.15)' : '0 1px 0 rgba(0, 0, 0, 0.08)',
        padding: '3px 0',
        height: '28px',
        zIndex: 100,
        position: 'relative'
      }
    }, [
      render('PreviewControls', Preview.viewControls, theme, address),
    ])
  ]);
  exports.view = view;
});

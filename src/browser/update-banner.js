/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const {html} = require('reflex');
  const {mix} = require('common/style');
  const {Record, Union} = require('common/typed');
  const Embedding = require('common/embedding');

  // Model

  const Model = Record({
    appUpdateAvailable: false,
    runtimeUpdateAvailable: false
  });
  exports.Model = Model;

  // Actions

  const {SystemAction} = Embedding.Action;


  const ApplicationUpdate = Record({isApplicationUpdate: true},
                                   'Updater.Action.ApplicationUpdate');
  const RuntimeUpdate = Record({isRuntimeUpdate: true},
                               'Updater.Action.RuntimeUpdate');
  const Upgrade = Record({
    isApplicationUpdate: true,
    isRuntimeUpdate: true
  }, 'Updater.Action.Upgrade');

  const Action = Union({ApplicationUpdate, RuntimeUpdate, Upgrade});
  exports.Action = Action;

  // Update

  const update = (state, action) =>
    action instanceof ApplicationUpdate ? state.set('appUpdateAvailable', true) :
    action instanceof RuntimeUpdate ? state.set('runtimeUpdateAvailable', true) :
    action instanceof Upgrade ? state.merge({appUpdateAvailable: true,
                                      runtimeUpdateAvailable: true}) :
    state;
  exports.upgrade = update;

  // Style

  const styleContainer = {
    position: 'absolute',
    bottom: 10,
    width: 400,
    left: 'calc(50vw - 200px)',
    backgroundColor: 'rgba(36,60,83,0.95)',
    borderRadius: 4,
    padding: 8,
    color: 'white',
    transition: 'opacity 500ms ease-in',
    fontWeight: '100',
    cursor: 'default'
  };

  const styleHiddenContainer = mix(styleContainer, {
    opacity: 0,
    pointerEvents: 'none',
  });

  const styleButton = {
    padding: '8px 20px',
    backgroundColor: 'rgb(115,206,113)',
    borderRadius: 4,
    float: 'right',
    cursor: 'pointer'
  };

  const styleMessage = {
    float: 'left',
    padding: 8
  };

  // View

  // FIXME: Work around issue #339
  const Restart = SystemAction({type: 'restart'});
  const CleanRestart = SystemAction({type: 'clear-cache-and-restart'});
  const CleanReload = SystemAction({type: 'clear-cache-and-reload'});

  const view = ({runtimeUpdateAvailable, appUpdateAvailable}, address) => {
    const message = runtimeUpdateAvailable ? ' (restart required)' : '';
    const action = runtimeUpdateAvailable && appUpdateAvailable ? CleanRestart :
                   runtimeUpdateAvailable ? Restart :
                   appUpdateAvailable ? CleanReload :
                   null;

    return html.div({
      style: action ? styleContainer : styleHiddenContainer
    }, [
      html.div({
        key: 'bannerMessage',
      }, 'Hey! An update just for you!'),
      html.div({
        key:  'bannerButton',
        style: styleButton,
        onClick: action && address.send(action)
      }, `Apply ${message}`)
    ]);
  };

  exports.view = view;
});

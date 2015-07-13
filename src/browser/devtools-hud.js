/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const {html} = require('reflex');
  const {Style} = require('common/style');
  const {Record} = require('common/typed');
  const Settings = require('service/settings');

  // Model

  const Model = Record({
    enableHUD: false,
    enableRemoteDevtools: false,
    settings: Record({
      'apz.overscroll.enabled': false,
      'debug.fps.enabled': false,
      'debug.paint-flashing.enabled': false,
      'layers.low-precision': false,
      'layers.low-opacity': false,
      'layers.draw-borders': false,
      'layers.draw-tile-borders': false,
      'layers.dump': false,
      'layers.enable-tiles': false,
      'layers.async-pan-zoom.enabled': false
    })
  });
  exports.Model = Model;

  const SettingDescriptions = {
    'apz.overscroll.enabled': 'Enable overscroll effect',
    'debug.fps.enabled': 'FPS',
    'debug.paint-flashing.enabled': 'Paint flashing',
    'layers.low-precision': 'Low precision buffer & paint',
    'layers.low-opacity': 'Low precision opacity',
    'layers.draw-borders': 'Draw layer borders',
    'layers.draw-tile-borders': 'Draw tile borders',
    'layers.dump': 'Layers dump',
    'layers.enable-tiles': 'Enable tiles',
    'layers.async-pan-zoom.enabled': 'Enable APZC (restart required)'
  };


  // Action

  const ToggleDevtoolsHUD = Record({
    description: 'Toggle DevTools HUD'
  }, 'DevtoolsHUD.ToggleHUD')

  exports.ToggleDevtoolsHUD = ToggleDevtoolsHUD;

  // update

  const update = (state, action) => {

    const updateSettingIfNeeded = (name, value) => {
      if (name in state.get('settings')) {
        state = state.setIn(['settings', name], value);
      }
      if (name == 'debugger.remote-mode') {
        state = state.set('enableRemoteDevtools', value == 'adb-devtools');
      }
    }

    if (action instanceof Settings.Changed) {
      updateSettingIfNeeded(action.name, action.value);
    }

    if (action instanceof Settings.Fetched) {
      for (var [name, value] of action.settings) {
        updateSettingIfNeeded(name, value);
      }
    }

    if (action instanceof ToggleDevtoolsHUD) {
      state = state.set('enableHUD', !state.get('enableHUD'));
    }
    return state;
  }
  exports.update = update;


  // FIXME: how can I avoid this ugly hack?
  // I want to call Settings.Fetch only once
  // to initialize the Model values.
  var fetched = false;
  const fetchInitialValuesIfNeeded = (state, address) => {
    if (fetched) {
      return;
    }
    fetched = true;
    for (var name of [...state.get('settings').keys()]) {
      address.receive(Settings.Fetch({
        id: 'devtools:fetch' + name,
        query: name}));
    }
    var name = 'debugger.remote-mode';
    address.receive(Settings.Fetch({
      id: 'devtools:fetch:debugger.remote-mode',
      query: name}));
  }

  const view = (state, address) => {

    fetchInitialValuesIfNeeded(state, address);

    const settingsCheckboxes =
      [...state.get('settings').keys()].map(settingName => html.label({
        key: settingName,
        style: {
          padding: 6,
          MozUserSelect: 'none',
          display: 'block',
        },
      }, [
        html.input({
          type: 'checkbox',
          checked: state.getIn(['settings', settingName]),
          style: {
            marginRight: 6,
            MozAppearance: 'checkbox'
          },
          onChange: e => {
            var setting = {};
            setting[settingName] = e.target.checked;
            navigator.mozSettings.createLock().set(setting);
          }
        }), SettingDescriptions[settingName]
      ]));

    return html.div({
      key: 'devtools-toolbox',
      style: {
        display: state.enableHUD ? 'block' : 'none',
        padding: 10,
        position: 'absolute',
        bottom: 10,
        left: 10,
        width: '300px',
        height: '350px',
        backgroundColor: 'white',
        border: '2px solid #F06',
        overflow: 'scroll',
      }
    }, [
      html.h1({
        style: {
          margin: 10
        }
      }, 'F12 to toggle DevTools'),
      html.label({
        key: 'enableRemoteDevtools',
        style: {
          padding: 6,
          MozUserSelect: 'none',
          display: 'block'
        }
      }, [
        html.input({
          type: 'checkbox',
          checked: state.get('enableRemoteDevtools'),
          style: {
            marginRight: 6,
            MozAppearance: 'checkbox'
          },
          onChange: e => {
            navigator.mozSettings.createLock().set({
              'debugger.remote-mode': e.target.checked ? 'adb-devtools' : 'disabled'
            });
          }
        }), 'Enable Remote DevTools'
      ]), settingsCheckboxes]);
  };

  exports.view = view;
});

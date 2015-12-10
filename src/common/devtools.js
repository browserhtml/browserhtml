/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* @flow */

/*:: import * as type from '../../type/common/devtools' */

import * as Settings from '../common/settings';
import * as Runtime from '../common/runtime';
import {merge} from '../common/prelude';
import {Effects, html, thunk} from 'reflex';
import {Style, StyleSheet} from '../common/style';

export const initial/*:type.Model*/ = {
  isActive: false,
  settings: null
};

const descriptions = {
  'debugger.remote-mode': 'Enable Remote DevTools',
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

const writeValue = (key, value) =>
    key === 'debugger.remote-mode'
  ? ( value === true
    ? 'adb-devtools'
    : 'disabled'
    )
  : value

const readValue = (key, value) =>
    key === 'debugger.remote-mode'
  ? ( value === 'adb-devtools'
    ? true
    : false
    )
  : value

const settings = Object.keys(descriptions);

export const Toggle =
  {type: "Devtools.Toggle"};

export const RequestRestart =
  {type: "Devtools.RequestRestart"};

export const RequestCleanRestart =
  {type: "Devtools.RequestCleanRestart"};

export const RequestCleanReload =
  {type: "Devtools.RequestCleanReload"};

export const asRequestSettingUpdate = (name, value) =>
  ({type: "Devtools.RequestSettingUpdate", name, value});

export const initialize/*:type.initialize*/ = () =>
  [
    initial,
    Effects.batch([
      Settings.fetch(settings),
      ...settings.map(Settings.observe)
    ])
  ];

const updateSetting = (model, name, value) =>
  settings.indexOf(name) < 0 ?
    model :
  model.settings == null ?
    model :
    merge(model, {
      settings: merge(model.settings, {
        [name]: value
      })
    });

export const step/*:type.step*/ = (model, action) =>
  action.type === 'Devtools.Toggle' ?
    [merge(model, {isActive: !model.isActive}), Effects.none] :
  action.type === 'Settings.NotSupported' ?
    // TODO: Report error
    [model, Effects.none] :
  action.type === 'Settings.Changed' ?
    [
      updateSetting(model, action.name, action.value),
      Settings.observe(action.name)
    ] :
  action.type === 'Settings.Fetched' ?
    [
      merge(model, {settings: action.settings}),
      Effects.none
    ] :
  action.type === 'Settings.FetchError' ?
    // TODO: Handle fetch error
    [
      model,
      Effects.none
    ] :
  action.type === 'Settings.Updated' ?
    // We updated UI on user request so there should be no need
    // to do anything in here. Although likely it's better to mark
    // setting as not yet commited and reset it if update fails.
    [model, Effects.none] :
  action.type === 'Settings.UpdateError' ?
    [model, Effects.none] :

  action.type === 'Devtools.RequestSettingUpdate' ?
    [
      updateSetting(model, action.name, action.value),
      Settings.update({[action.name]: action.value})
    ] :
  action.type === 'Devtools.RequestRestart' ?
    [model, Runtime.restart()] :
  action.type === 'Devtools.RequestCleanRestart' ?
    [model, Runtime.clearRestart()] :
  action.type === 'Devtools.RequestCleanReload' ?
    [model, Runtime.cleanReload()] :
    [model, Effects.none];


const style = StyleSheet.create({
  checkbox: {
    marginRight: '6px',
    MozAppearance: 'checkbox',
  },
  label: {
    padding: '6px',
    MozUserSelect: 'none',
    display: 'block',
  },
  button: {
    display: 'block',
    border: '1px solid #AAA',
    padding: '3px 6px',
    margin: '6px',
    borderRadius: '3px',
  },
  toolbox: {
    padding: '10px',
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    width: '300px',
    height: '400px',
    color: 'black',
    backgroundColor: 'white',
    border: '2px solid #F06',
    overflow: 'scroll',
  },
  initializing: {
    display: 'none'
  },
  hidden: {
    display: 'none'
  },
  visible: {
    display: 'block'
  },
});

export const viewSetting = (key, value, address) => {
  const isChecked = readValue(key, value);

  return html.label({
    key: key,
    style: style.label,
  }, [
    html.input({
      type: 'checkbox',
      checked: isChecked ? true : void(0),
      style: style.checkbox,
      onChange: _ =>
        address(asRequestSettingUpdate(key, writeValue(key, !isChecked)))
    }),
    descriptions[key]
  ]);
};

export const viewSettings = (settings, address) =>
  html.div({
    key: 'devtools-settings',
    className: 'devtools settings',
  }, Object.keys(settings || {})
           .map(key => thunk(key, viewSetting, key, settings[key], address)))

export const view/*:type.view*/ = (model, address) =>
  html.div({
    className: 'devtools toolbox',
    key: 'devtools-toolbox',
    style: Style(style.toolbox,
                 model.settings == null ?
                  style.initializing :
                model.isActive ?
                  style.visible :
                  style.hidden)
  }, [
    thunk('settings', viewSettings, model.settings, address),
    html.button({
      style: style.button,
      onClick: _ => address(RequestRestart)
    }, ['Restart']),
    html.button({
      style: style.button,
      onClick: _ => address(RequestCleanRestart)
    }, ['Clear cache and restart']),
    html.button({
      style: style.button,
      onClick: _ => address(RequestCleanReload)
    }, ['Clear cache and reload'])
  ]);

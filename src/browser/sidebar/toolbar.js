/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {html, thunk, forward} from 'reflex';
import {Style, StyleSheet} from '../../common/style';
import * as Toggle from "../../common/toggle";
import {merge, cursor} from "../../common/prelude";

export const Attach = {type: "Attach"};
export const Detach = {type: "Detach"};
export const CreateWebView = {type: "CreateWebView"};

const Pin = action =>
    action.type === "Check"
  ? Attach
  : action.type === "Uncheck"
  ? Detach
  : ({type: "Pin", action});

const pin = cursor({
  get: model => model.pin,
  set: (model, pin) => merge(model, {pin}),
  tag: Pin,
  update: Toggle.step
});

export const init = () => {
  const [pin, fx] = Toggle.init()
  return [
    {pin},
    fx.map(Pin)
  ]
}

export const Model = ({pin}) => ({pin});

export const step = (model, action) =>
    action.type === "Attach"
  ? pin(model, Toggle.Check)
  : action.type === "Detach"
  ? pin(model, Toggle.Uncheck)
  : action.type === "Pin"
  ? pin(model, action.action)
  : Unknown.step(model, action)

export const styleSheet = StyleSheet.create({
  toolbar: {
    left: '0',
    height: '50px',
    position: 'absolute',
    bottom: '0',
    width: '100%'
  },

  createTabButton: {
    MozWindowDragging: 'no-drag',
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'FontAwesome',
    fontSize: '18px',
    lineHeight: '34px',
    position: 'absolute',
    textAlign: 'center',
    bottom: '8px',
    right: '8px',
    width: '34px',
    height: '34px',
  }
});

const viewPin = Toggle.view('pin-button', StyleSheet.create({
  base: {
    cursor: 'pointer',
    borderRadius: '5px',
    height: '34px',
    width: '34px',
    margin: '8px',
    backgroundRepeat: 'no-repeat',
    backgroundColor: 'transparent',
    backgroundPosition: 'center',
    backgroundImage: 'url(css/pin.png)',
    backgroundSize:
        window.devicePixelRatio == null
      ? '24px 36px'
      : `${24 / window.devicePixelRatio}px ${36 / window.devicePixelRatio}px`
  },
  checked: {
    backgroundColor: '#3D91F2'
  }
}));

export const view = (model, address, {toolbarOpacity}) =>
  html.div({
    key: 'sidebar-toolbar',
    className: 'sidebar-toolbar',
    style: Style(
      styleSheet.toolbar,
      {opacity: toolbarOpacity}
    )
  }, [
    thunk('pin', viewPin, model.pin, forward(address, Pin)),
    html.div({
      className: 'sidebar-create-tab-icon',
      style: styleSheet.createTabButton,
      onClick: () => address(CreateWebView)
    }, [''])
  ]);

/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {html, thunk, forward} from 'reflex';
import {Style, StyleSheet} from '../../common/style';
import * as Toggle from "../../common/toggle";
import {merge} from "../../common/prelude";
import {cursor} from "../../common/cursor";
import * as Unknown from "../../common/unknown";

/*:: import * as type from "../../../type/browser/sidebar/toolbar" */

export const Attach/*:type.Attach*/ =
  { type: "Attach"
  };

export const Detach/*:type.Detach*/ =
  { type: "Detach"
  };

const ToggleAction = action =>
    action.type === "Check"
  ? Attach
  : action.type === "Uncheck"
  ? Detach
  : ({type: "Toggle", action});

const updateToggle = cursor({
  get: model => model.pin,
  set: (model, pin) => merge(model, {pin}),
  tag: ToggleAction,
  update: Toggle.update
});

export const init/*:type.init*/ = () => {
  const [pin, fx] = Toggle.init()
  return [
    {pin},
    fx.map(ToggleAction)
  ]
}

export const Model/*:type.Toolbar*/ =
  ({pin}) =>
  ({pin});

export const update/*:type.update*/ = (model, action) =>
  ( action.type === "Attach"
  ? updateToggle(model, Toggle.Check)
  : action.type === "Detach"
  ? updateToggle(model, Toggle.Uncheck)
  : action.type === "Toggle"
  ? updateToggle(model, action.action)

  : Unknown.update(model, action)
  );

export const styleSheet = StyleSheet.create({
  toolbar: {
    left: '0',
    height: '50px',
    position: 'absolute',
    bottom: '0',
    width: '100%',
    background: '#364759'
  }
});

const viewPin = Toggle.view('pin-button', StyleSheet.create({
  base: {
    cursor: 'pointer',
    height: styleSheet.toolbar.height,
    width: styleSheet.toolbar.height,
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#3E5166',
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

export const view/*:type.view*/ = (model, address) =>
  html.div({
    key: 'sidebar-toolbar',
    className: 'sidebar-toolbar',
    style: styleSheet.toolbar
  }, [
    thunk('pin', viewPin, model.pin, forward(address, ToggleAction))
  ]);

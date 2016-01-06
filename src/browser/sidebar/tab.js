/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {html, thunk, forward, Effects} from 'reflex';
import {Style, StyleSheet} from '../../common/style';
import * as Toolbar from './toolbar';
import * as Image from '../../common/image';
import {always} from '../../common/prelude';
import {readTitle, readFaviconURI} from '../web-view';

/*:: import * as type from "../../../type/browser/sidebar/tab" */

export const Close = {type: "Close"};
export const Select = {type: "Select"};
export const Activate = {type: "Activate"};
export const Unselect = {type: "Unselect"};
export const Deactivate = {type: "Deactivate"};


const styleSheet = StyleSheet.create({
  base: {
    MozWindowDragging: 'no-drag',
    borderRadius: '5px',
    lineHeight: '35px',
    color: '#fff',
    fontSize: '14px',
    overflow: 'hidden',
    padding: '0 10px 0 33px',
    position: 'relative',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  selected: {
    backgroundColor: '#3D5166'
  },
  unselected: null,
  title: {
    display: 'inline'
  }
});

const viewIcon = Image.view('favicon', StyleSheet.create({
  base: {
    borderRadius: '3px',
    left: '9px',
    position: 'absolute',
    top: '10px',
    width: '16px',
    height: '16px'
  }
}));

export const update/*:type.update*/ = (model, action) =>
  [model, Effects.none];

export const view/*:type.view*/ = (model, address) =>
  html.div
  ( { className: 'sidebar-tab'
    , style: Style
      ( styleSheet.base
      , ( model.isSelected
        ? styleSheet.selected
        : styleSheet.unselected
        )
      )
    , onMouseDown: forward(address, always(Select))
    , onMouseUp: forward(address, always(Activate))
    }
  , [ viewIcon({uri: readFaviconURI(model)}, address)
    , html.div
      ( { className: 'sidebar-tab-title'
        , style: styleSheet.title
        }
        // @TODO localize this string
      , [readTitle(model, 'Untitled')]
      )
    ]);

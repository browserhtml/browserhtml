/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {html, thunk, forward, Effects} from 'reflex';
import {Style, StyleSheet} from '../../common/style';
import * as Toolbar from './toolbar';
import * as Image from '../../common/image';
import * as Target from "../../common/target";
import * as Unknown from "../../common/unknown";

import {always, merge} from '../../common/prelude';
import {readTitle, readFaviconURI} from '../web-view/util';
import {cursor} from '../../common/cursor';


/*:: import * as type from "../../../type/browser/sidebar/tab" */

export const Close = {type: "Close"};
export const Select = {type: "Select"};
export const Activate = {type: "Activate"};

const TargetAction = action =>
  ( { type: "Target"
    , source: action
    }
  );

const updateTarget =
  cursor
  ( { update: Target.update
    , tag: TargetAction
    }
  );

const Out = TargetAction(Target.Out);
const Over = TargetAction(Target.Over);

export const init = () =>
  [ { isPointerOver: false
    }
  , Effects.none
  ];

export const update = (model, action) =>
  ( action.type === "Target"
  ? updateTarget(model, action.source)
  : Unknown.update(model, action)
  );


const styleSheet = StyleSheet.create({
  base: {
    MozWindowDragging: 'no-drag',
    borderRadius: '5px',
    height: '34px',
    color: '#fff',
    overflow: 'hidden'
  },

  container: {
    height: '34px',
    lineHeight: '34px',
    width: '312px',
    color: '#fff',
    fontSize: '14px',
    overflow: 'hidden',
    position: 'relative'
  },

  selected: {
    backgroundColor: '#3D91F2'
  },
  unselected: {
  },

  title: {
    display: 'block',
    margin: '0 10px 0 34px',
    overflow: 'hidden',
    width: '270px',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },



  closeMask: {
    background: `linear-gradient(
      to right,
      rgba(36,48,61,0) 0%,
      rgba(36,48,61,1) 20%,
      rgba(36,48,61,1) 100%)`,
    width: '34px',
    height: '34px',
    position: 'absolute',
    paddingLeft: '10px',
    right: 0,
    top: 0
  },

  closeMaskSelected: {
    background: `linear-gradient(
      to right,
      rgba(61,145,242,0) 0%,
      rgba(61,145,242,1) 20%,
      rgba(61,145,242,1) 100%)`
  },
  closeMaskUnselected: {

  },

  closeMaskHidden: {
    opacity: 0,
    pointerEvents: 'none'
  },

  closeMaskVisible: {

  },

  closeIcon: {
    color: '#fff',
    fontFamily: 'FontAwesome',
    fontSize: '12px',
    width: '34px',
    height: '34px',
    lineHeight: '34px',
    textAlign: 'center'
  }
});

const viewIcon = Image.view('favicon', StyleSheet.create({
  base: {
    borderRadius: '3px',
    left: '9px',
    position: 'absolute',
    top: '9px',
    width: '16px',
    height: '16px'
  }
}));

// TODO: Use button widget instead.
const viewClose = ({isSelected, tab}, address) =>
  html.div
  ( { className: 'tab-close-mask'
    , style:
        Style
        ( styleSheet.closeMask
        , ( isSelected
          ? styleSheet.closeMaskSelected
          : styleSheet.closeMaskUnselected
          )
        , ( tab.isPointerOver
          ? styleSheet.closeMaskVisible
          : styleSheet.closeMaskHidden
          )
        )
    }, [
      html.div
      ( { className: 'tab-close-icon'
        , style: styleSheet.closeIcon
        , onClick: forward(address, always(Close))
        }, [''])
  ]);

export const view/*:type.view*/ = (model, address, {tabWidth, titleOpacity}) =>
  html.div
  ( { className: 'sidebar-tab'
    , style: Style
      ( styleSheet.base
      , ( model.isSelected
        ? styleSheet.selected
        : styleSheet.unselected
        )
      , { width: `${tabWidth}px` }
      )
    , onMouseOver: forward(address, always(Over))
    , onMouseOut: forward(address, always(Out))
    , onMouseDown: forward(address, always(Select))
    , onMouseUp: forward(address, always(Activate))
    }
  , [ html.div
      ( { className: 'sidebar-tab-inner'
        , style: styleSheet.container
        }
      , [ viewIcon
          ( { uri: readFaviconURI(model) }
          , address
          )
        , html.div
          ( { className: 'sidebar-tab-title'
            , style:
              Style
              ( styleSheet.title
              , { opacity: titleOpacity }
              )
            }
            // @TODO localize this string
          , [ readTitle(model, 'Untitled')
            ]
          )
        , thunk('close', viewClose, model, address)
        ]
      )
    ]
  );

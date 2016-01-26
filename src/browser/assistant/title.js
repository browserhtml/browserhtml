/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


import {Effects, html, forward, thunk} from "reflex";
import {merge, always, batch} from "../../common/prelude";
import {Style, StyleSheet} from '../../common/style';

/*::
import * as Title from "../../../type/browser/assistant/title"
*/


const styleSheet = StyleSheet.create
  ( { base:
      { color: 'rgba(0,0,0,0.7)'
      , fontSize: '14px'
      }
    , selected:
      { color: '#fff'
      }
    , unselected:
      {

      }
    }
  );

export const render/*:Title.view*/ =
  model =>
  html.span
  ( { className: 'assistant title'
    , style: Style
      ( styleSheet.base
      , ( model.isSelected
        ? styleSheet.selected
        : styleSheet.unselected
        )
      )
    }
  , [ ( model.title == null
      ? 'Untitled'
      : model.title
      )
    ]
  );

export const view/*:Title.view*/ =
  model =>
  thunk
  ( String(model.title)
  , render
  , model
  );

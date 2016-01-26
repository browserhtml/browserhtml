/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


import {Effects, html, forward, thunk} from "reflex";
import {merge, always, batch} from "../../common/prelude";
import {Style, StyleSheet} from '../../common/style';

import * as Title from "./title";
import * as Icon from "./icon";

/*::
import * as Suggestion from "../../../type/browser/assistant/suggestion"
*/


const styleSheet = StyleSheet.create
  ( { base:
      { borderBottom: '1px solid rgba(0,0,0,0.08)'
      , lineHeight: '40px'
      , overflow: 'hidden'
      , paddingLeft: '35px'
      , paddingRight: '10px'
      // Contains absolute elements.
      , position: 'relative'
      , whiteSpace: 'nowrap'
      , textOverflow: 'ellipsis'
      }
    , unselected:
      {
      }
    , selected:
      { background: '#4A90E2'
      , borderBottomColor: 'transparent'
      , borderRadius: '3px'
      }
    }
  );

export const render = /*::<model:Suggestion.Model, action>*/
  (model/*:model*/, address/*:Suggestion.Address<action>*/, innerView/*:Suggestion.InnerView<model, action>*/)/*:Suggestion.VirtualTree*/ =>
  html.li
  ( { className: 'assistant suggestion'
    , style: Style
      ( styleSheet.base
      , ( model.isSelected
        ? styleSheet.selected
        : styleSheet.unselected
        )
      )
    }
  , innerView(model, address)
  );

export const view = /*::<model:Suggestion.Model, action>*/
  (model/*:model*/, address/*:Suggestion.Address<action>*/, innerView/*:Suggestion.InnerView<model, action>*/)/*:Suggestion.VirtualTree*/ =>
  thunk
  ( model.id
  , render
  , model
  , innerView
  );

/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


import {Effects, html, forward, thunk} from "reflex";
import {merge, always, batch} from "../../common/prelude";
import {Style, StyleSheet} from '../../common/style';

/*::
import * as Group from "../../../type/browser/assistant/group"
*/

export const init = /*::<model, action>*/
  (size/*:number*/, limit/*:number*/)/*:Group.Step<model, action>*/ =>
  [ { size
    , limit
    , selected: null
    , matches: {}
    , items: []
    }
  , Effects.none
  ]

const replaceMatches =
  (model, matches) =>
  [ merge
    ( model
    , { matches
      }
    )
  , Effects.none
  ];

const updateMatch =
  (model, {id, action}) =>

export const update = /*::<model, action>*/
  (model/*:Group.Model<model>*/, action/*:Group.Action<model, action>*/)/*:Group.Step<model, action>*/ =>
  ( action.type === 'ReplaceMatches'
  ? replaceMatches(model, action.source)
  : action.type === 'Match'
  ? updateMatch(model, action.source)
  : Unknown.update(model, action)
  );

/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {html, Effects} from 'reflex';
import * as Style from '../../../common/style';
import * as Config from '../../../../browserhtml.json';
import * as Unknown from '../../../common/unknown';
/*::
import type {Address, DOM} from "reflex"
import type {Model, Action} from "./help"
*/

export const init =
  ()/*:[Model, Effects<Action>]*/ =>
  [ { issuesURI: Config.issues_url
    }
  , Effects.none
  ]

export const update =
  (model/*:Model*/, action/*:Action*/)/*:[Model, Effects<Action>]*/ =>
  Unknown.update(model, action)

const styleSheet = Style.createSheet
  ( { base:
      { cursor: 'pointer'
      , display: 'block'
      , color: '#999'
      , fontSize: '12px'
      , lineHeight: '20px'
      , position: 'absolute'
      , bottom: '10px'
      , right: '15px'
      , textDecoration: 'none'
      }
    , textLight:
      { color: 'rgba(0,0,0,0.8)'
      }
    , textDark:
      { color: 'rgba(255,255,255,0.7)'
      }
    }
  );

export const view =
  (model/*:Model*/, address/*:Address<Action>*/, isDark/*:boolean*/)/*:DOM*/ =>
  html.a
  ( { className: 'help'
    , style: Style.mix
      ( styleSheet.base
      , ( isDark
        ? styleSheet.textDark
        : styleSheet.textLight
        )
      )
    , href: model.issuesURI
    }
    // @TODO localize this string
  , [ 'File a Bug'
    ]
  );

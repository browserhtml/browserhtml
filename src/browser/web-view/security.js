/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*:: import * as type from '../../../type/browser/web-view/security' */

import {Effects} from 'reflex';
import * as Unknown from '../../common/unknown';
import {merge} from '../../common/prelude';

export const LoadStart/*:type.LoadStart*/ = {type: "LoadStart"};
export const Changed/*:type.Changed*/ = (state, extendedValidation) =>
  ({type: "Changed", state, extendedValidation});

export const init/*:type.init*/ = () =>
  [ {state: 'insecure', secure: false, extendedValidation: false}
  , Effects.none
  ]

export const update/*:type.update*/ = (model, action) =>
  ( action.type === "LoadStart"
  ? [ merge
      ( model
      , { state: 'insecure'
        , secure: false
        , extendedValidation: false
        }
      )
    , Effects.none
    ]
  : action.type === 'Changed'
  ? [ merge
      ( model
      , { state: action.state
        , secure: action.state === 'secure'
        , extendedValidation: action.extendedValidation
        }
      )
    , Effects.none
    ]
  : Unknown.update(model, action)
  );

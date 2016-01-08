/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {html, thunk, forward, Effects} from 'reflex';
import {Style, StyleSheet} from '../common/style';

/*:: import * as type from "../../type/common/image" */

export const Model/*:type.Image*/ =
  ({uri}) =>
  ({uri});

const coreStyleSheet = StyleSheet.create
  ( { image:
      { backgroundSize: 'cover'
      , backgroundPosition: 'center center'
      , backgroundRepeat: 'no-repeat'
      , border: 'none'
      }
    }
  );

export const view/*:type.view*/ =
  (key, styleSheet) =>
  (model, address, contextStyle) =>
    html.img
    ( { style: Style
          ( coreStyleSheet.image
          , styleSheet.base
          , { backgroundImage: `url(${model.uri})`
            }
          , contextStyle
          )
      }
    )

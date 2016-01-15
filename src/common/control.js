/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


import {merge, always} from "../common/prelude"
import {cursor} from "../common/cursor"
import * as Unknown from "../common/unknown"
import * as Target from "../common/target"
import * as Focusable from "../common/focusable"
import {Style} from "../common/style"
import {html, Effects, forward} from "reflex"

/*::
import * as type from "../../type/common/control"
*/

export const Disable/*:type.Disable*/ =
  { type: "Disable"
  };

export const Enable/*:type.Enable*/ =
  { type: "Enable"
  };

const enable =
  model =>
  [ merge(model, {isDisabled: false})
  , Effects.none
  ];

const disable =
  model =>
  [ merge(model, {isDisabled: true})
  , Effects.none
  ];

export const update/*:type.update*/ =
  (model, action) =>
  ( action.type === "Enable"
  ? enable(model)
  : action.type === "Disable"
  ? disable(model)
  : Unknown.update(model, action)
  );

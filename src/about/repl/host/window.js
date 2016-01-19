/* @noflow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {html, thunk, forward, Effects, Task} from 'reflex';
import {merge, batch, tag, tagged} from "../../../common/prelude";
import * as Result from "../../../common/result";
import {Style, StyleSheet} from '../../../common/style';

const DELETE = new String('delete');
const executeWith = (context, execute) => {
  const keys = Object.keys(context);
  const stash =
    keys
    .reduce
    ( (stash, key) => {
        stash[key] =
          ( window.hasOwnProperty(key)
          ? window[key]
          : DELETE
          );

        window[key] = context[key];

        return stash;
      }
    , {}
    );

  try {
    return execute();
  }
  finally {
    keys
    .forEach
    ( key => {
        if (window[key] === context[key]) {
          if (stash[key] === DELETE) {
            delete window[key]
          }
          else {
            window[key] = stash[key]
          }
        }
      }
    )
  }
}

const evalContext =
  { out: []
  , html
  , thunk
  , forward
  , Effects
  , Task
  , merge
  , batch
  , tag
  , tagged
  , Result
  }

export const evaluate =
  (id, code) =>
  Task.future(() => new Promise(resolve => {
    try {
      const out = executeWith(evalContext, () => window.eval(code));
      evalContext.out[id] = out;
      resolve(Result.ok(out));
    }
    catch (error) {
      evalContext.out[id] = error;
      resolve(Result.error(error))
    }
  }))

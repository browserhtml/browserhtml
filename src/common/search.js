/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


/*:: import * as type from "../../type/common/search" */
import {Task, Effects} from "reflex"


const asMatch/*:type.asMatch*/ = title => ({
  type: "Search.Match",
  title,
  uri: `https://duckduckgo.com/?q=${encodeURIComponent(title)}`
})

export const query/*:type.query*/ = (input, limit) =>
  Effects.task(Task.future(() => new Promise(resolve => {
    const request = new XMLHttpRequest({mozSystem: true});
    request.open('GET', `https://ac.duckduckgo.com/ac/?q=${input}&type=list`, true);
    request.responseType = 'json';
    request.send();
    request.onload = () => {
      const {response} = request
      if (response && response[1]) {
        resolve({
          type: "Search.Result",
          input,
          search: response[1].map(asMatch)
        })
      }
    }
  })))

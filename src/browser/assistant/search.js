/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


import {Effects, html, forward, thunk} from "reflex";
import {merge, always, batch} from "../../common/prelude";
import {Style, StyleSheet} from '../../common/style';

import * as Title from "./title";
import * as Icon from "./icon";
import * as Suggestion from "./suggestion";

/*::
import * as Search from "../../../type/browser/assistant/search"
*/

const decodeFailure = ({target: request}) =>
  Result.error
  (Error(`Failed to send request to ${request.url} : ${request.statusText}`));

const decodeResponseFailure =
  request =>
  Result.error(Error(`Can not decode ${request.respose} received from ${request.url}`))

const decodeMatches =
  matches =>
  ( Array.isArray(matches)
  ? matches.map(decodeMatch)
  : Result.error(Error(`Can not decode non array matches ${matches}`))
  );

  request.response[1].url !== 'string')
  ? decodeResponseFailure(request)
  : Result.ok
    ( { uri: request.response[0].url
      , title:
        ( request.response[0].title == null
        ? null
        : String(request.response[0].title)
        )
      }
    )
  );

const decodeResponse = ({target: request}) =>
  ( request.responseType !== 'json'
  ? Result.error(Error(`Can not decode ${request.responseType} type response from ${request.url}`))
  : request.response == null
  ? decodeResponseFailure(request)
  : request.response[1] == null
  ? decodeResponseFailure(request)
  : decodeMatches(request.response[1])
  );


export const query/*:Search.query*/ =
  (input, limit) =>
  Task.future(() => new Promise(resolve => {
    if (query.request !== null) {
      query.request.abort();
    }

    const request = new XMLHttpRequest({ mozSystem: true });
    request.open
    ( 'GET'
    , `https://ac.duckduckgo.com/ac/?q=${input}&type=list`
    , true
    );
    request.responseType = 'json';
    request.send();
    request.onerror = event => resolve(decodeFailure(event));
    request.onload = event => resolve(decodeResponse(event));
    query.request = request
  }));



const innerView =
  (model, address) =>
  [ Icon.view(model, '')
  , Title.view(model, address)
  ];

export const render/*:Search.view*/ =
  (model, address) =>
  Suggestion.view
  ( model
  , address
  , innerView
  );

export const view/*:Search.view*/ =
  (model, address) =>
  thunk
  ( model.id
  , render
  , model
  , address
  );

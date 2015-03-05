/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const {DOM} = require('react');
  const Component = require('omniscient');

  const Deck = Item => Component('Deck', (options, handlers) =>
    DOM.div(options, options.items.map(item => Item({
      key: item.get('id'),
      item
    }, handlers))));

  // Exports:

  exports.Deck = Deck;

});

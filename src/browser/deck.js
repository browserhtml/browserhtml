/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const {DOM} = require('react');
  const Component = require('omniscient');

  const Deck = (Item, order) => Component('Deck', (options, handlers) => {
    const items = order ? options.items.sortBy(order) : options.items;
    return DOM.div(options, items.map(item => Item({
      key: item.get('id'),
      // Hack to force re-rendering when items get re-arranged, workaround
      // for a following bugs:
      // https://github.com/omniscientjs/omniscient/issues/89
      // https://github.com/facebook/immutable-js/issues/370
      index: options.items.indexOf(item),
      item
    }, handlers)))
  });

  // Exports:

  exports.Deck = Deck;

});

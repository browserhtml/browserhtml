/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, moudle) => {

  'use strict';

  const {DOM} = require('react');
  const Component = require('omniscient');
  const url = require('./util/url');
  const {Deck} = require('./deck');
  const {select, activate, remove, isSelected} = require('./deck/actions');

  const readThumbnailURI = uri =>
    'none' && `url(/tiles/${url.getDomainName(uri)}.png)`;

  const Tab = Component(({items, item: webViewerCursor}) =>
    DOM.div({
      key: `tab-${webViewerCursor.get('id')}`,
      className: 'tab' +
                 (isSelected(webViewerCursor) ? ' selected' : ''),
      style: {
        backgroundImage: readThumbnailURI(webViewerCursor.get('location'))
      },
      onMouseOver: event => select(items, webViewerCursor),
      onMouseDown: event => activate(items),
      onMouseUp: event => {
        if (event.button == 1) {
          event.stopPropagation();
          remove(items, webViewerCursor);
        }
      }
    }));
  Tab.Deck = Deck(Tab);


  // Exports:

  exports.Tab = Tab;

});

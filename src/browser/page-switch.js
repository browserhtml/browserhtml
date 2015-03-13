/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, moudle) => {

  'use strict';

  const {DOM} = require('react');
  const Component = require('omniscient');
  const url = require('./util/url');
  const {Deck} = require('./deck');
  const {isSelected, arrange} = require('./deck/actions');
  const ClassSet = require('./util/class-set');

  const Tab = Component('Tab', ({item: webViewerCursor, order}, {onSelect, onActivate, onClose}) => {
    const thumbnail = webViewerCursor.get('thumbnail')
    return DOM.div({
      className: ClassSet({
        tab: true,
        selected: isSelected(webViewerCursor)
      }),
      style: { order: order },
      onMouseOver: event => onSelect(webViewerCursor),
      onMouseDown: event => onActivate(),
      onMouseUp: event => {
        if (event.button == 1) {
          event.stopPropagation();
          onClose(webViewerCursor);
        }
      }
    }, [
      DOM.div({
        key: 'thumbnail',
        className: 'tab-thumbnail',
      }, [
        DOM.img({
          key: 'image',
          src: thumbnail,
          alt: '',
          onLoad: event => URL.revokeObjectURL(event.target.src)
        })
      ]),
      DOM.div({
        key: 'close-button',
        hidden: webViewerCursor.get('isPinned'),
        onClick: event => onClose(webViewerCursor),
        className: "tab-close-button fa fa-times",
      })
    ])
  });
  Tab.Deck = Component('Deck', (options, handlers) => {
    const {items} = options;
    const ordered = arrange(items);
    const count = items.count();
    return DOM.div(options, items.map(item => Tab({
      key: item.get('id'),
      order: ordered.indexOf(item),
      item
    }, handlers)))
  });

  // Exports:

  exports.Tab = Tab;
});

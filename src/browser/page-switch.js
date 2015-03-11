/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, moudle) => {

  'use strict';

  const {DOM} = require('react');
  const Component = require('omniscient');
  const url = require('./util/url');
  const {Deck} = require('./deck');
  const {isSelected} = require('./deck/actions');
  const ClassSet = require('./util/class-set');

  const Tab = Component('Tab', ({item: webViewerCursor}, {onSelect, onActivate, onClose}) => {
    const thumbnail = webViewerCursor.get('thumbnail')
    return DOM.div({
      className: ClassSet({
        tab: true,
        selected: isSelected(webViewerCursor)
      }),
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
          className: 'image',
          src: thumbnail,
          alt: '',
          onLoad: event => URL.revokeObjectURL(event.target.src),
          onError: event => webViewerCursor.set('thumbnail', null)
        })
      ]),
      DOM.div({
        key: 'close-button',
        onClick: event => onClose(webViewerCursor),
        className: "tab-close-button fa fa-times",
      })
    ])
  });
  Tab.Deck = Deck(Tab);

  // Exports:

  exports.Tab = Tab;

});

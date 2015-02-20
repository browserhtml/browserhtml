/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const Component = require('omniscient');
  const {DOM} = require('react');
  const {NavigationPanel} = require('./navigation-panel');
  const {WebViewer} = require('./web-viewer');
  const {Tab} = require('./page-switch');
  const {Element, Event, Field, Attribute} = require('./element');
  const {KeyBindings} = require('./keyboard');
  const {zoomIn, zoomOut, zoomReset, open,
         goBack, goForward, reload, stop} = require('./web-viewer/actions');
  const {focus, showTabStrip, hideTabStrip,
         writeSession, resetSession} = require('./actions');
  const {indexOfSelected, selectNext, selectPrevious, select,
         indexOfPreviewed, previewNext, previewPrevious, preview,
         previewed, remove, append} = require('./deck/actions');
  const {readTheme} = require('./theme');

  const getOwnerWindow = node => node.ownerDocument.defaultView;
  // Define custom `main` element with a custom `scrollGrab` attribute
  // that maps to same named proprety.
  const Main = Element('main', {
    os: Attribute('os'),
    title: Field((node, current, past) => {
      node.ownerDocument.title = current;
    }),
    scrollGrab: Field((node, current, past) => {
      node.scrollgrab = current;
    }),
    onDocumentFocus: Event('focus', getOwnerWindow),
    onDocumentBlur: Event('blur', getOwnerWindow),
    onDocumentKeyDown: Event('keydown', getOwnerWindow),
    onDocumentKeyUp: Event('keyup', getOwnerWindow),
    onDocumentUnload: Event('unload', getOwnerWindow)
  });

  const onNavigation = KeyBindings({
    'accel l': focus,
    'accel t': focus
  });

  const onTabStripKeyDown = KeyBindings({
    'control tab': showTabStrip,
    'control shift tab': showTabStrip,
    'meta shift ]': showTabStrip,
    'meta shift [': showTabStrip,
    'meta t': showTabStrip,
  });
  const onTabStripKeyUp = KeyBindings({
    'control': hideTabStrip,
    'meta shift': hideTabStrip
  });

  const onViewerBinding = KeyBindings({
    'accel =': zoomIn,
    'accel -': zoomOut,
    'accel 0': zoomReset,
    'accel left': goBack,
    'accel right': goForward,
    'escape': stop,
    'accel r': reload,
    'F5': reload
  });

  const openTab = items => {
    const item = open();
    const isItem = x => x == item;
    return preview(select(append(items, item), isItem), isItem);
  }

  // If closing viewer, replace it with a fresh one & select it.
  // This avoids code branching down the pipe that otherwise will
  // need to deal with 0 viewer & no active viewer case.
  const closeTab = items =>
    items.count() > 1 ? remove(items) :
    remove(append(items, open()));

  const selectPreviewed = items => {
    const id = previewed(items).get("id");
    select(items, item => item.get("id") == id);
  }

  const edit = edit => cursor => cursor.update(edit);
  const onDeckBinding = KeyBindings({
    'accel t': edit(openTab),
    'accel w': edit(closeTab),
    'control tab': edit(previewNext),
    'control shift tab': edit(previewPrevious),
    'meta shift ]': edit(previewNext),
    'meta shift [': edit(previewPrevious),
    'ctrl pagedown': edit(previewNext),
    'ctrl pageup': edit(previewPrevious)
  });

  const onDeckBindingRelease = KeyBindings({
    'control': selectPreviewed,
    'meta shift': selectPreviewed
  });

  const onBrowserBinding = KeyBindings({
    'accel shift backspace': edit(resetSession),
    'accel shift s': writeSession
  });

  // Functional composition
  const compose = (...fns) => {
    const [init, ...steps] = fns.reverse();
    return (...args) =>
      steps.reduce((x, step) => step(x), init(...args));
  }


  // Browser is a root component for our application that just delegates
  // to a core sub-components here.
  const Browser = Component(immutableState => {
    const selectIndex = indexOfSelected(immutableState.get('webViewers'));
    const previewIndex = indexOfPreviewed(immutableState.get('webViewers'));
    const webViewersCursor = immutableState.cursor('webViewers');

    const selectedWebViewerCursor = webViewersCursor.cursor(selectIndex);
    const previewedWebViewerCursor = webViewersCursor.cursor(previewIndex);

    const tabStripCursor = immutableState.cursor('tabStrip');
    const inputCursor = immutableState.cursor('input');

    const isTabStripVisible = tabStripCursor.get('isActive') &&
                              webViewersCursor.count() > 1;

    const theme = readTheme(previewedWebViewerCursor);

    return Main({
      os: immutableState.get('os'),
      title: selectedWebViewerCursor.get('uri'),
      scrollGrab: true,
      className: 'moz-noscrollbars' +
                 (theme.isDark ? ' isdark' : '') +
                 (immutableState.get('isDocumentFocused') ? ' windowFocused' : '') +
                 (isTabStripVisible ? ' showtabstrip' : ''),
      onDocumentUnload: event => writeSession(immutableState),
      onDocumentFocus: event => immutableState.set('isDocumentFocused', true),
      onDocumentBlur: event => immutableState.set('isDocumentFocused', false),
      onDocumentKeyDown: compose(onNavigation(inputCursor),
                                 onTabStripKeyDown(tabStripCursor),
                                 onViewerBinding(selectedWebViewerCursor),
                                 onDeckBinding(webViewersCursor),
                                 onBrowserBinding(immutableState)),
      onDocumentKeyUp: compose(onTabStripKeyUp(tabStripCursor),
                               onDeckBindingRelease(webViewersCursor))
    }, [
      NavigationPanel({
        key: 'navigation',
        inputCursor,
        tabStripCursor,
        theme,
        selectedWebViewerCursor: previewedWebViewerCursor,
      }),
      DOM.div({key: 'tabstrip',
               style: theme.tabstrip,
               className: 'tabstripcontainer'}, [
        Tab.Deck({key: 'tabstrip',
                  className: 'tabstrip',
                  items: webViewersCursor})
      ]),
      DOM.div({key: 'tabstripkillzone',
               className: 'tabstripkillzone',
               onMouseEnter: event => hideTabStrip(tabStripCursor)}),

      WebViewer.Deck({key: 'deck',
                      className: 'iframes',
                      items: webViewersCursor}),
    ]);
  });

  // Exports:

  exports.Main = Main;
  exports.Browser = Browser;

});

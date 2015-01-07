
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * mergetoolbars.js
 *
 */

require(['js/tabiframedeck'],
function(TabIframeDeck) {

  'use strict';

  TabIframeDeck.on('select', OnTabSelected);

  let lastSelectedTab = null;

  function OnTabSelected() {
    let selectedTabIframe = TabIframeDeck.getSelected();
    if (lastSelectedTab) {
      lastSelectedTab.off('mozbrowserasyncscroll', OnScroll);
    }
    lastSelectedTab = selectedTabIframe;
    selectedTabIframe.on('mozbrowserasyncscroll', OnScroll);
  }

  OnTabSelected();

  let lastTop = 0;
  function OnScroll(eventName, event, tabIframe) {
    if (tabIframe != TabIframeDeck.getSelected()) {
      return;
    }

    if (eventName != 'mozbrowserasyncscroll') {
      return;
    }

    let top = event.detail.top;

    if (top == lastTop) {
      return;
    }

    if (top != 0) {
      if (lastTop < top) {
        document.body.classList.add("scrollingdown");
      } else {
        document.body.classList.remove("scrollingdown");
      }
      document.body.classList.add("scrolled");
    } else {
      document.body.classList.remove("scrollingdown");
      document.body.classList.remove("scrolled");
    }
    lastTop = top;
  };

});

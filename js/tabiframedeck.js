/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * tabiframedeck.js
 *
 * This is the central piece of Firefox.html.
 * TabIframeDeck controls the list of <tab-iframe>s.
 *
 * TabIframeDeck object is used to manipulate the list
 * of tabs (add, remove, select, …) and be notified
 * on tab changes (events like "select", "add", …).
 *
 */

define(["js/tabiframe", "js/eventemitter"], function(TabIframe, EventEmitter) {

  "use strict";

  let _tabIframeArray = [];
  let _selectIndex = -1;

  const TabIframeDeck = {

    onMozBrowserOpenWindow: function(type, event) {
      TabIframeDeck.add({url:event.detail.url});
    },

    add: function(options={}) {
      let tabIframe = document.createElement("tab-iframe");
      tabIframe.setAttribute("flex", "1");

      let parent = document.querySelector(".iframes");
      parent.appendChild(tabIframe);
      _tabIframeArray.push(tabIframe);

      tabIframe.on("mozbrowseropenwindow", this.onMozBrowserOpenWindow);

      this.emit("add", {tabIframe: tabIframe});

      if (options.url) {
        tabIframe.setLocation(options.url);
      }

      if (options.select || _selectIndex < 0) {
        this.select(tabIframe);
      } else {
        tabIframe.hide();
      }

      return tabIframe;
    },

    remove: function(tabIframe) {
      let index = _tabIframeArray.indexOf(tabIframe);
      if (index < 0) {
        throw new Error("Unknown tabIframe");
      }

      if (_tabIframeArray.length == 1) {
        throw new Error("Deck has only one tabiframe");
      }

      if (index == _selectIndex) {
        let newSelectIndex;
        if (index == _tabIframeArray.length - 1) {
          newSelectIndex = index - 1;
        } else {
          newSelectIndex = index + 1;
        }
        this.select(_tabIframeArray[newSelectIndex]);
      }

      if (_selectIndex > index) {
        _selectIndex--;
      }

      _tabIframeArray.splice(index, 1);
      tabIframe.off("mozbrowseropenwindow", this.onMozBrowserOpenWindow);
      tabIframe.remove();

      this.emit("remove", {tabIframe});
    },

    select: function(tabIframe) {
      let index = _tabIframeArray.indexOf(tabIframe);
      if (index < 0) {
        throw new Error("Unknown tabiframe");
      }

      if (index == _selectIndex) {
        // already selected
        return;
      }

      tabIframe.willBeVisibleSoon();

      let previouslySelectTabIframe = _tabIframeArray[_selectIndex];
      if (previouslySelectTabIframe) {
        this.emit("unselect", {tabIframe: previouslySelectTabIframe});
      }

      _selectIndex = index;

      this.emit("select", {tabIframe});

      // Do the actual switch
      window.mozRequestAnimationFrame(() => {
        if (previouslySelectTabIframe) {
          previouslySelectTabIframe.hide();
        }
        tabIframe.show();
      });
    },

    selectNext: function() {
      let newSelectIndex = _selectIndex + 1;
      if (newSelectIndex == _tabIframeArray.length) {
        newSelectIndex = 0;
      }
      this.select(_tabIframeArray[newSelectIndex]);
    },

    selectPrevious: function() {
      let newSelectIndex = _selectIndex - 1;
      if (newSelectIndex < 0) {
        newSelectIndex = _tabIframeArray.length - 1;
      }
      this.select(_tabIframeArray[newSelectIndex]);
    },

    getSelected: function() {
      return _tabIframeArray[_selectIndex];
    },

    getCount: function() {
      return _tabIframeArray.length;
    },
  }

  TabIframeDeck[Symbol.iterator] = function*() {
    for (let tabIframe of _tabIframeArray) {
      yield tabIframe;
    }
  }

  EventEmitter.decorate(TabIframeDeck);
  TabIframeDeck.add();

  return TabIframeDeck;
});

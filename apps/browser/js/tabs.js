/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require(['js/tabiframedeck', 'js/urlhelper'],
function(TabIframeDeck, UrlHelper) {

  'use strict';

  // Where will store the tab objects, with their linked
  // <tab-iframe>
  const allTabs = new Map();

  const tabs = document.querySelector('#tabs');

  function Tab(tabIframe) {
    let div = document.createElement('div');
    div.className = 'tab';

    div.onmousedown = (event) => {
      if (event.button == 0) {
        TabIframeDeck.select(tabIframe);
      }
    };

    div.onmouseup = (event) => {
      if (event.button == 1) {
        event.stopPropagation();
        TabIframeDeck.remove(tabIframe);
      }
    }

    let title = document.createElement('span');
    title.classList.add('title');

    let icon = document.createElement('img');
    icon.classList.add('icon');

    /*
    let button = document.createElement('button');
    button.className = 'close-button';
    button.title = 'Close Tab';

    button.onmouseup = (event) => {
      if (event.button == 0) {
        event.stopPropagation();
        TabIframeDeck.remove(tabIframe);
      }
    };
    */

    div.appendChild(icon);
    div.appendChild(title);
    // div.appendChild(button);

    this._dom = div;

    this._tabIframe = tabIframe;
    this._trackTabIframe();

    tabs.appendChild(this._dom);

    this.updateDom();
  }

  Tab.prototype = {

    get tabIframe() {
      return this._tabIframe;
    },

    get dom() {
      return this._dom;
    },

    destroy: function() {
      this._untrackTabIframe();
      this._tabIframe = null;
      this.dom.remove();
    },

    select: function() {
      this.dom.classList.add('selected');
    },

    unselect: function() {
      this.dom.classList.remove('selected');
    },

    _eventsToTrack: [
      'mozbrowserloadstart',
      'mozbrowserloadend',
      'mozbrowsertitlechange',
      'mozbrowserlocationchange',
      'mozbrowsericonchange',
      'mozbrowsererror'
    ],

    _trackTabIframe: function() {
      this.updateDom = this.updateDom.bind(this);
      for (let e of this._eventsToTrack) {
        this.tabIframe.on(e, this.updateDom);
      }
    },

    _untrackTabIframe: function() {
      for (let e of this._eventsToTrack) {
        this.tabIframe.off(e, this.updateDom);
      }
    },

    updateDom: function() {
      if (this.tabIframe.loading) {
        this.dom.classList.add('loading');
      } else {
        this.dom.classList.remove('loading');
      }

      if (this.tabIframe.color) {
        this.dom.style.setProperty('--theme-color', this.tabIframe.color);
      } else {
        this.dom.style.setProperty('--theme-color', 'inherit');
      }

      let title = this.tabIframe.title;
      if (!title) {
        if (this.tabIframe.location) {
          title = this.tabIframe.location;
        } else {
          title = 'New Tab';
        }
      }

      this.dom.title = title;
      this.dom.querySelector('.title').textContent = title;

      let faviconImg = this.dom.querySelector('.icon');
      if (this.tabIframe.favicon) {
        faviconImg.src = this.tabIframe.favicon;
      } else {
        faviconImg.removeAttribute('src');
      }
    },
  };

  TabIframeDeck.on('add', (event, detail) => {
    let tabIframe = detail.tabIframe;
    let tab = new Tab(tabIframe);
    allTabs.set(tabIframe, tab);
    if (tabIframe == TabIframeDeck.getSelected()) {
      tab.select();
    }
  });

  TabIframeDeck.on('remove', (event, detail) => {
    let tab = allTabs.get(detail.tabIframe);
    if (tab) {
      tab.destroy();
      allTabs.delete(detail.tabIframe);
    }
  });

  TabIframeDeck.on('select', (event, detail) => {
    let tab = allTabs.get(detail.tabIframe);
    if (tab) {
      tab.select();
    }
  });

  TabIframeDeck.on('unselect', (event, detail) => {
    let tab = allTabs.get(detail.tabIframe);
    if (tab) {
      tab.unselect();
    }
  });

  for (let tabIframe of TabIframeDeck) {
    let tab = new Tab(tabIframe);
    allTabs.set(tabIframe, tab);
  }

  let tabIframe = TabIframeDeck.getSelected();
  if (tabIframe) {
    let tab = allTabs.get(tabIframe);
    tab.select();
  }

});


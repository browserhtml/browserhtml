/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require(['js/urlhelper', 'js/tabiframedeck', 'js/keybindings'],
function(UrlHelper, TabIframeDeck, RegisterKeyBindings) {

  'use strict';

  let navbar = document.querySelector('.navbar');
  let pageTitle = navbar.querySelector('.pagetitle');
  let pageUrlSummary = navbar.querySelector('.pageurlsummary');
  let urlTemplate = 'https://search.yahoo.com/search?p={searchTerms}';
  let urlbar = navbar.querySelector('.urlbar');
  let urlinput = navbar.querySelector('.urlinput');
  let backButton = navbar.querySelector('.back-button')
  let forwardButton = navbar.querySelector('.forward-button')
  let reloadButton = navbar.querySelector('.reload-button');
  let stopButton = navbar.querySelector('.stop-button');
  let winCloseButton = navbar.querySelector('.win-close-button');
  let winMaxButton = navbar.querySelector('.win-max-button');
  let winMinButton = navbar.querySelector('.win-min-button');

  urlinput.addEventListener('focus', () => {
    urlinput.select();
    navbar.classList.add('urledit');
  })

  urlinput.addEventListener('blur', () => {
    navbar.classList.remove('urledit');
  })

  function updateWindowFocus() {
    if (document.hasFocus()) {
      document.body.classList.add('windowFocused');
    } else {
      document.body.classList.remove('windowFocused');
    }
  }
  window.addEventListener('focus', updateWindowFocus);
  window.addEventListener('blur', updateWindowFocus);
  updateWindowFocus();

  backButton.onclick = () => TabIframeDeck.getSelected().goBack();
  forwardButton.onclick = () => TabIframeDeck.getSelected().goForward();
  reloadButton.onclick = () => TabIframeDeck.getSelected().reload();
  stopButton.onclick = () => TabIframeDeck.getSelected().stop();
  winCloseButton.onclick = () => window.close();
  winMinButton.onclick = () => window.minimize();
  winMaxButton.onclick = () => {
    if (document.mozFullScreenElement) {
      document.mozCancelFullScreen();
    } else {
      document.body.mozRequestFullScreen();
    }
  }

  urlinput.addEventListener('keypress', (e) => {
    if (e.keyCode == 13) {
      // URL entered
      let text = urlinput.value;
      let url = text;
      if (UrlHelper.isNotURL(text)) {
        url = urlTemplate.replace('{searchTerms}', encodeURIComponent(text));
      } else {
        if (!UrlHelper.hasScheme(text)) {
          url = 'http://' + text;
        }
      }
      let tabIframe = TabIframeDeck.getSelected();
      tabIframe.setLocation(url);
      tabIframe.focus();
    }
  });

  urlinput.addEventListener('input', () => {
    TabIframeDeck.getSelected().userInput = urlinput.value;
  });

  RegisterKeyBindings(
    [window.OS == 'osx' ? 'Cmd' : 'Ctrl', 'l',   () => {
      urlinput.focus();
      urlinput.select();
    }]
  );

  const NAVBAR_EVENTS = [
    'mozbrowserloadstart',
    'mozbrowserloadend',
    'mozbrowserlocationchange',
    'mozbrowsererror',
    'mozbrowsersecuritychange',
  ];

  let lastSelectedTab = null;
  function OnTabSelected() {
    let selectedTabIframe = TabIframeDeck.getSelected();
    if (lastSelectedTab) {
      for (let e of NAVBAR_EVENTS) {
        lastSelectedTab.off(e, TabChanged);
      }
    }
    lastSelectedTab = selectedTabIframe;
    if (selectedTabIframe) {
      if (!selectedTabIframe.location) {
        urlinput.focus();
        urlinput.select();
      } else {
        selectedTabIframe.focus();
      }
      for (let e of NAVBAR_EVENTS) {
        lastSelectedTab.on(e, TabChanged);
      }
      TabChanged(null, null, selectedTabIframe);
    }
  }
  TabIframeDeck.on('select', OnTabSelected);
  OnTabSelected();

  function TabChanged(eventName, event, tabIframe) {
    if (tabIframe != TabIframeDeck.getSelected()) {
      return;
    }

    if (tabIframe.loading) {
      navbar.classList.add('loading');
    } else {
      navbar.classList.remove('loading');
      if (tabIframe.location) {
        urlinput.blur();
      }
    }

    if (tabIframe.userInput) {
      urlinput.value = tabIframe.userInput;
    } else if (tabIframe.location) {
      urlinput.value = UrlHelper.trim(tabIframe.location);
    } else if (eventName === null) {
      urlinput.value = '';
    }

    if (tabIframe.title) {
      pageTitle.textContent = tabIframe.title;
    } else {
      if (tabIframe.location) {
        pageTitle.textContent = tabIframe.location;
      } else {
        pageTitle.textContent = tabIframe.userInput;
      }
    }


    if (tabIframe.location) {
      let hostname = UrlHelper.getHostname(tabIframe.location);
      hostname = hostname.replace(/^www\./, '');
      pageUrlSummary.textContent = hostname + ': ';
    } else {
      pageUrlSummary.textContent = "";
    }

    if (!window.IS_PRIVILEGED) {
      return;
    }

    if (tabIframe.securityState == 'secure') {
      navbar.classList.add('ssl');
      navbar.classList.toggle('sslev', tabIframe.securityExtendedValidation);
    } else {
      navbar.classList.remove('ssl');
      navbar.classList.remove('sslev');
    }

    if (tabIframe.color) {
      navbar.style.setProperty('--bg', tabIframe.color);
      let hex = tabIframe.color; // FIXME: assuming a HEX value
      let r = parseInt(hex.substring(1, 3), 16);
      let g = parseInt(hex.substring(3, 5), 16);
      let b = parseInt(hex.substring(5, 7), 16);
      let lum = Math.sqrt(r * r * .241 + g * g * .691 + b * b * .068);
      navbar.classList.toggle('dark-bg', lum < 128);
    } else {
      navbar.style.setProperty('--bg', 'inherit');
      navbar.classList.remove('dark-bg');
    }

    tabIframe.canGoBack().then(canGoBack => {
      // Make sure iframe is still selected
      if (tabIframe != TabIframeDeck.getSelected()) {
        return;
      }
      navbar.classList.toggle('cangoback', canGoBack);
      backButton.classList.toggle('disabled', !canGoBack);
    });

    tabIframe.canGoForward().then(canGoForward => {
      // Make sure iframe is still selected
      if (tabIframe != TabIframeDeck.getSelected()) {
        return;
      }
      navbar.classList.toggle('cangoforward', canGoForward);
      forwardButton.classList.toggle('disabled', !canGoForward);
    });
  };

  function PreprocessUrlInput(input) {
  };

});

/* Scroll
require(['js/tabiframedeck'],
function(TabIframeDeck) {

  'use strict';

  const CTRL_KEY = 17;
  const CMD_KEY = 224;
  window.addEventListener("keydown", (e) => {
    if (e.keyCode == CTRL_KEY) {
      document.body.classList.add("ctrlpressed");
    }
    if (e.keyCode == CMD_KEY) {
      document.body.classList.add("cmdpressed");
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.keyCode == CTRL_KEY) {
      document.body.classList.remove("ctrlpressed");
    }
    if (e.keyCode == CMD_KEY) {
      document.body.classList.remove("cmdpressed");
    }
  });

  let lastSelectedTab = null;

  const NAVBAR_EVENTS = [
    'mozbrowserloadstart',
    'mozbrowserloadend',
    'mozbrowserlocationchange',
    'mozbrowsererror',
    'mozbrowsersecuritychange',
  ];

  let ignoreScroll;
  let ignoreScrollTimeout;
  let lastTop;

  function OnTabSelected() {
    let selectedTabIframe = TabIframeDeck.getSelected();
    document.body.classList.remove("scrollingdown");
    document.body.classList.remove("scrollingup");
    document.body.classList.remove("scrolled");
    clearTimeout(ignoreScrollTimeout);
    ignoreScroll = true;
    ignoreScrollTimeout = setTimeout(() => {
      ignoreScroll = false;
      OnScroll(null, null, selectedTabIframe);
    }, 1500);
    lastTop = 0;
    if (lastSelectedTab) {
      lastSelectedTab.off('mozbrowserasyncscroll', OnScroll);
    }
    lastSelectedTab = selectedTabIframe;
    if (selectedTabIframe) {
      selectedTabIframe.on('mozbrowserasyncscroll', OnScroll);
    }
  }
  TabIframeDeck.on('select', OnTabSelected);
  OnTabSelected();

  function OnScroll(eventName, event, tabIframe) {
    if (tabIframe != TabIframeDeck.getSelected() ||
        ignoreScroll) {
      return;
    }
    let top = tabIframe.contentScrollTop;
    if (top != 0) {
      if (lastTop < top) {
        document.body.classList.add("scrollingdown");
        document.body.classList.remove("scrollingup");
      } else {
        document.body.classList.remove("scrollingdown");
        document.body.classList.add("scrollingup");
      }
      document.body.classList.add("scrolled");
    } else {
      document.body.classList.remove("scrollingdown");
      document.body.classList.remove("scrollingup");
      document.body.classList.remove("scrolled");
    }
    lastTop = top;
  };

});
*/


require(['js/tabiframedeck'], function(TabIframeDeck) {

  'use strict';

  let tabstrip = document.querySelector('.tabstrip');

  let allTabs = new Map();

  function Tab(tabIframe) {
    let tab = document.createElement('div');
    tab.className = 'tab';

    tab.onmousedown = (event) => {
      if (event.button == 0) {
        TabIframeDeck.select(tabIframe);
      }
    };

    tab.onmouseup = (event) => {
      if (event.button == 1) {
        event.stopPropagation();
        TabIframeDeck.remove(tabIframe);
      }
    }

    this._dom = tab;

    this._tabIframe = tabIframe;
    this.updateDom = this.updateDom.bind(this);
    for (let e of this._eventsToTrack) {
      this.tabIframe.on(e, this.updateDom);
    }

    tabstrip.appendChild(this._dom);

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
      for (let e of this._eventsToTrack) {
        this.tabIframe.off(e, this.updateDom);
      }
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
      'mozbrowsertitlechange'
    ],

    updateDom: function() {
      if (this.tabIframe.loading) {
        this.dom.classList.add('loading');
      } else {
        this.dom.classList.remove('loading');
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

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * navbar.js
 *
 * Code handling the navigation bar. The navigation bar includes
 * the back/forward/stop/reload buttons, the url bar and the search
 * bar.
 *
 */

require(['js/urlhelper', 'js/tabiframedeck', 'js/keybindings'],
function(UrlHelper, TabIframeDeck, RegisterKeyBindings) {

  'use strict';

  let link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/navbar.css';
  let defaultStyleSheet = document.querySelector('link[title=default]');
  document.head.insertBefore(link, defaultStyleSheet.nextSibling);

  let html = `
    <hbox class='navbar toolbar' align='center'>
      <hbox class='urlbar' flex='1' align='center'>
        <div class='identity'></div>
        <input placeholder='Search or enter address' class='urlinput' flex='1'>
      </hbox>
    </hbox>
  `;
  let outervbox = document.querySelector('#outervbox');
  let outerhbox = document.querySelector('#outerhbox');
  let placeholder = document.createElement('hbox');
  outervbox.insertBefore(placeholder, outerhbox);
  placeholder.outerHTML = html;

  let navbar = document.querySelector('.navbar');

  let urlTemplate = 'https://search.yahoo.com/search?p={searchTerms}';

  let urlbar = navbar.querySelector('.urlbar');
  let urlinput = navbar.querySelector('.urlinput');

  urlinput.addEventListener('focus', () => {
    urlinput.select();
    urlbar.classList.add('focus');
  })

  urlinput.addEventListener('blur', () => {
    urlbar.classList.remove('focus');
  })

  urlinput.addEventListener('keypress', (e) => {
    if (e.keyCode == 13) {
      UrlInputChanged()
    }
  });

  urlinput.addEventListener('input', () => {
    TabIframeDeck.getSelected().userInput = urlinput.value;
  });

  let mod = window.OS == 'osx' ? 'Cmd' : 'Ctrl';

  RegisterKeyBindings(
    [mod,    'l',   () => {
      urlinput.focus();
      urlinput.select();
    }]
  );

  function UrlInputChanged() {
    let text = urlinput.value;
    let url = PreprocessUrlInput(text);
    let tabIframe = TabIframeDeck.getSelected();
    tabIframe.setLocation(url);
    tabIframe.focus();
  }

  TabIframeDeck.on('select', OnTabSelected);

  let lastSelectedTab = null;

  let events = [
    'mozbrowserloadstart',
    'mozbrowserloadend',
    'mozbrowserlocationchange',
    'mozbrowsererror',
    'mozbrowsersecuritychange',
    'mozbrowsermetachange'
  ];

  function OnTabSelected() {
    let selectedTabIframe = TabIframeDeck.getSelected();
    if (lastSelectedTab) {
      for (let e of events) {
        lastSelectedTab.off(e, UpdateTab);
      }
      lastSelectedTab.off('mozbrowserasyncscroll', OnScroll);
    }
    lastSelectedTab = selectedTabIframe;
    if (selectedTabIframe) {
      if (!selectedTabIframe.location) {
        // urlinput.focus();
        // urlinput.select();
      }
      for (let e of events) {
        lastSelectedTab.on(e, UpdateTab);
      }
      selectedTabIframe.on('mozbrowserasyncscroll', OnScroll);
      UpdateTab(null, null, selectedTabIframe);
    }
  }

  OnTabSelected();

  function UpdateTab(eventName, event, tabIframe) {
    if (tabIframe != TabIframeDeck.getSelected()) {
      return;
    }

    if (tabIframe.loading) {
      navbar.classList.add('loading');
    } else {
      navbar.classList.remove('loading');
    }

    if (tabIframe.userInput) {
      urlinput.value = tabIframe.userInput;
    } else if (tabIframe.location) {
      urlinput.value = UrlHelper.trim(tabIframe.location);
    } else if (eventName === null) {
      urlinput.value = '';
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
      document.body.style.backgroundColor = tabIframe.color;
    } else {
      document.body.style.backgroundColor = "#00AAE5";
    }

    tabIframe.canGoBack().then(canGoBack => {
      // Make sure iframe is still selected
      if (tabIframe != TabIframeDeck.getSelected()) {
        return;
      }
      if (canGoBack) {
      } else {
      }
    });

    tabIframe.canGoForward().then(canGoForward => {
      // Make sure iframe is still selected
      if (tabIframe != TabIframeDeck.getSelected()) {
        return;
      }
      if (canGoForward) {
      } else {
      }
    });
  };

  function PreprocessUrlInput(input) {
    if (UrlHelper.isNotURL(input)) {
      return urlTemplate.replace('{searchTerms}', encodeURIComponent(input));
    }

    if (!UrlHelper.hasScheme(input)) {
      input = 'http://' + input;
    }

    return input;
  };


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

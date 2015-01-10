/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * navlayer.js
 *
 * Code handling the navigation bar. The navigation bar includes
 * the back/forward/stop/reload buttons, the url bar and the search
 * bar.
 *
 */

require(['js/urlhelper', 'js/tabiframedeck', 'js/keybindings', 'js/tiles'],
function(UrlHelper, TabIframeDeck, RegisterKeyBindings) {

  'use strict';

  let navlayer = document.querySelector('#navlayer');

  let searchTemplate = 'https://search.yahoo.com/search?p={searchTerms}';

  let navbar = navlayer.querySelector('#navbar');
  let userinput = navlayer.querySelector('#userinput');

  userinput.addEventListener('focus', () => {
    userinput.select();
    navbar.classList.add('focus');
  })

  userinput.addEventListener('blur', () => {
    navbar.classList.remove('focus');
  })

  userinput.addEventListener('keypress', (e) => {
    if (e.keyCode == 13) {
      UserInputChanged()
    }
  });

  userinput.addEventListener('input', () => {
    TabIframeDeck.getSelected().userInput = userinput.value;
  });

  let mod = window.OS == 'osx' ? 'Cmd' : 'Ctrl';

  RegisterKeyBindings(
    [mod,    'l',   () => {
      userinput.focus();
      userinput.select();
    }]
  );

  function UserInputChanged() {
    let text = userinput.value;
    let url = PreprocessUserInput(text);
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
        userinput.focus();
        userinput.select();
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
      navlayer.classList.add('loading');
    } else {
      navlayer.classList.remove('loading');
    }

    if (tabIframe.userInput) {
      userinput.value = tabIframe.userInput;
    } else if (tabIframe.location) {
      userinput.value = UrlHelper.trim(tabIframe.location);
    } else if (eventName === null) {
      userinput.value = '';
    }

    if (!window.IS_PRIVILEGED) {
      return;
    }

    if (tabIframe.securityState == 'secure') {
      navlayer.classList.add('ssl');
      navlayer.classList.toggle('sslev', tabIframe.securityExtendedValidation);
    } else {
      navlayer.classList.remove('ssl');
      navlayer.classList.remove('sslev');
    }

    if (tabIframe.color) {
      document.body.style.setProperty('--theme-color', tabIframe.color);
    } else {
      document.body.style.setProperty('--theme-color', 'inherit');
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

  function PreprocessUserInput(input) {
    if (UrlHelper.isNotURL(input)) {
      return searchTemplate.replace('{searchTerms}', encodeURIComponent(input));
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

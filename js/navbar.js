/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require(['js/urlhelper', 'js/tabiframedeck', 'js/keybindings', 'js/tabstrip'],
function(UrlHelper, TabIframeDeck, RegisterKeyBindings) {

  'use strict';

  let navbar = document.querySelector('.navbar');

  let urlTemplate = 'https://search.yahoo.com/search?p={searchTerms}';

  let urlbar = navbar.querySelector('.urlbar');
  let urlinput = navbar.querySelector('.urlinput');
  let backButton = navbar.querySelector('.back-button')
  let forwardButton = navbar.querySelector('.forward-button')
  let reloadButton = navbar.querySelector('.reload-button');
  let stopButton = navbar.querySelector('.stop-button');

  let lastTop = 0;

  backButton.onclick = () => TabIframeDeck.getSelected().goBack();
  forwardButton.onclick = () => TabIframeDeck.getSelected().goForward();
  reloadButton.onclick = () => TabIframeDeck.getSelected().reload();
  stopButton.onclick = () => TabIframeDeck.getSelected().stop();

  urlinput.addEventListener('focus', () => {
    document.body.classList.add('urlbarFocused');
    urlinput.select();
    urlbar.classList.add('focus');
  })

  urlinput.addEventListener('blur', () => {
    document.body.classList.remove('urlbarFocused');
    urlbar.classList.remove('focus');
  })

  urlinput.addEventListener('keypress', (e) => {
    if (e.keyCode == 13) {
      UrlInputChanged()
    }
  });

  document.querySelector('.button-close').onclick = () => {
    window.close();
  }

  document.querySelector('.button-minimize').onclick = () => {
    window.minimize();
  }

  document.querySelector('.button-maximize').onclick = () => {
    if (document.mozFullScreenElement) {
      document.mozCancelFullScreen();
    } else {
      document.body.mozRequestFullScreen();
    }
  }

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
  ];

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

  let ignoreScroll;
  let ignoreScrollTimeout;
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
      for (let e of events) {
        lastSelectedTab.off(e, UpdateTab);
      }
      lastSelectedTab.off('mozbrowserasyncscroll', OnScroll);
    }
    lastSelectedTab = selectedTabIframe;
    if (selectedTabIframe) {
      if (!selectedTabIframe.location) {
        urlinput.focus();
        urlinput.select();
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
      document.body.classList.add('loading');
    } else {
      navbar.classList.remove('loading');
      document.body.classList.remove('loading');
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

    tabIframe.canGoBack().then(canGoBack => {
      // Make sure iframe is still selected
      if (tabIframe != TabIframeDeck.getSelected()) {
        return;
      }
      if (canGoBack) {
        backButton.classList.remove('disabled');
      } else {
        backButton.classList.add('disabled');
      }
    });

    tabIframe.canGoForward().then(canGoForward => {
      // Make sure iframe is still selected
      if (tabIframe != TabIframeDeck.getSelected()) {
        return;
      }
      if (canGoForward) {
        forwardButton.classList.remove('disabled');
      } else {
        forwardButton.classList.add('disabled');
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

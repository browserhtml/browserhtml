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

require(["js/commands", "js/urlhelper", "js/tabiframedeck"],
function(Cmds, UrlHelper, TabIframeDeck) {

  "use strict";

  document.querySelector(".back-button").onclick = () => Cmds.goBack();
  document.querySelector(".forward-button").onclick = () => Cmds.goForward();
  document.querySelector(".reload-button").onclick = () => Cmds.reload();
  document.querySelector(".stop-button").onclick = () => Cmds.stop();

  let urlTemplate = "https://search.yahoo.com/search?p={searchTerms}";

  let urlbar = document.querySelector(".urlbar");
  let urlinput = document.querySelector(".urlinput");
  let navbar = document.querySelector(".navbar");

  urlinput.addEventListener("focus", () => {
    urlinput.select();
    urlbar.classList.add("focus");
  })

  urlinput.addEventListener("blur", () => {
    urlbar.classList.remove("focus");
  })

  urlinput.addEventListener("keypress", (e) => {
    if (e.keyCode == 13) {
      UrlInputChanged()
    }
  });

  urlinput.addEventListener("input", () => {
    TabIframeDeck.getSelected().userInput = urlinput.value;
  });

  let searchbar = document.querySelector(".searchbar");
  let searchinput = document.querySelector(".searchinput");
  searchinput.addEventListener("focus", () => {
    searchinput.select();
    searchbar.classList.add("focus");
  })
  searchinput.addEventListener("blur", () => searchbar.classList.remove("focus"))
  searchinput.addEventListener("keypress", (e) => {
    if (e.keyCode == 13) {
      SearchInputChanged()
    }
  });

  function UrlInputChanged() {
    let text = urlinput.value;
    let url = PreprocessUrlInput(text);
    let tabIframe = TabIframeDeck.getSelected();
    tabIframe.setLocation(url);
    tabIframe.focus();
  }

  function SearchInputChanged() {
    let text = searchinput.value;
    let url = urlTemplate.replace('{searchTerms}', encodeURIComponent(text));
    let tabIframe = TabIframeDeck.getSelected();
    tabIframe.setLocation(url);
    tabIframe.focus();
  }

  TabIframeDeck.on("select", OnTabSelected);

  let lastSelectedTab = null;

  function OnTabSelected() {
    let selectedTabIframe = TabIframeDeck.getSelected();
    if (lastSelectedTab) {
      lastSelectedTab.off("dataUpdate", UpdateTab);
    }
    lastSelectedTab = selectedTabIframe;
    if (selectedTabIframe) {
      if (!selectedTabIframe.location) {
        urlinput.focus();
        urlinput.select();
      }

      selectedTabIframe.on("dataUpdate", UpdateTab);
      UpdateTab();
    }
  }

  OnTabSelected();

  function UpdateTab() {
    let tabIframe = TabIframeDeck.getSelected();

    if (tabIframe.loading) {
      navbar.classList.add("loading");
    } else {
      navbar.classList.remove("loading");
    }

    if (tabIframe.userInput) {
      urlinput.value = tabIframe.userInput;
    } else {
      urlinput.value = tabIframe.location
    }

    if (!window.IS_PRIVILEGED) {
      return;
    }

    if (tabIframe.securityState == "secure") {
      navbar.classList.add("ssl");
      if (tabIframe.securityExtendedValidation) {
        navbar.classList.add("sslev");
      }
    } else {
      navbar.classList.remove("ssl");
      navbar.classList.remove("sslev");
    }

    tabIframe.canGoBack().then(canGoBack => {
      // Make sure iframe is still selected
      if (tabIframe != TabIframeDeck.getSelected()) {
        return;
      }
      if (canGoBack) {
        navbar.querySelector(".back-button").classList.remove("disabled");
      } else {
        navbar.querySelector(".back-button").classList.add("disabled");
      }
    });

    tabIframe.canGoForward().then(canGoForward => {
      // Make sure iframe is still selected
      if (tabIframe != TabIframeDeck.getSelected()) {
        return;
      }
      if (canGoForward) {
        navbar.querySelector(".forward-button").classList.remove("disabled");
      } else {
        navbar.querySelector(".forward-button").classList.add("disabled");
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

});

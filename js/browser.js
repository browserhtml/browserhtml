define([
  'js/url_helper'
], function(
  UrlHelper
) {

"use strict";

// Break circular dependencies
let Dependencies = {
  get Tab() {
    return require("js/tab");
  },
}

// gBrowser
// Extend Iframe prototype

HTMLIFrameElement.prototype.show = function() {
  this.removeAttribute("hidden");
  if (window.IS_PRIVILEGED) {
    this.setVisible(true);
  }
}

HTMLIFrameElement.prototype.hide = function() {
  this.setAttribute("hidden", "true");
  if (window.IS_PRIVILEGED) {
    this.setVisible(false);
  }
}

let gBrowser = {
  _tabs: new Set(),

  _selectedTab: null,

  _urlTemplate: "https://search.yahoo.com/search?p={searchTerms}",

  get selectedTab() {
    return this._selectedTab;
  },

  urlInputChanged: function() {
    let urlinput = document.querySelector(".urlinput");
    let text = urlinput.value;
    let url = this.preprocessUrlInput(text);
    this.selectedTab.iframe.src = url;
    this.selectedTab.iframe.focus();
  },

  searchInputChanged: function() {
    let searchinput = document.querySelector(".searchinput");
    let text = searchinput.value;
    let url = this._urlTemplate.replace('{searchTerms}', encodeURIComponent(text));
    this.selectedTab.iframe.src = url;
    this.selectedTab.iframe.focus();
  },

  selectedTabHasChanged: function() {
    let tab = this.selectedTab;

    document.title = "Firefox - " + tab.title;;

    if (tab.loading) {
      document.body.classList.add("loading");
    } else {
      document.body.classList.remove("loading");
    }

    let urlinput = document.querySelector(".urlinput");

    if (tab.userInput) {
      urlinput.value = tab.userInput;
    } else {
      urlinput.value = tab.location;
    }

    if (!window.IS_PRIVILEGED) {
      return;
    }

    if (tab.securityState == "secure") {
      document.body.classList.add("ssl");
      if (tab.securityExtendedValidation) {
        document.body.classList.add("sslev");
      }
    } else {
      document.body.classList.remove("ssl");
      document.body.classList.remove("sslev");
    }

    if (tab.hasIframe()) {
      let iframe = tab.iframe;

      iframe.getCanGoBack().onsuccess = r => {
        // Make sure iframe is still selected
        if (tab != this.selectedTab) {
          return;
        }
        if (r.target.result) {
          document.querySelector(".back-button").classList.remove("disabled");
        } else {
          document.querySelector(".back-button").classList.add("disabled");
        }
      }
      iframe.getCanGoForward().onsuccess = r => {
        // Make sure iframe is still selected
        if (tab != this.selectedTab) {
          return;
        }
        if (r.target.result) {
          document.querySelector(".forward-button").classList.remove("disabled");
        } else {
          document.querySelector(".forward-button").classList.add("disabled");
        }
      }
    } else {
      document.querySelector(".back-button").classList.add("disabled");
      document.querySelector(".forward-button").classList.add("disabled");
    }

  },

  addTab: function(url, select) {
    let tab = new Dependencies.Tab(document.querySelector(".iframes"));
    this._tabs.add(tab);

    if (url && window.IS_PRIVILEGED) {
      tab.iframe.src = url;
    }

    document.querySelector(".tabstrip").appendChild(tab.dom);

    tab.dom.onclick = () => this.selectTab(tab);

    if (select) {
      this.selectTab(tab);
    } else {
      tab.unselect();
    }
    return tab;
  },

  selectTab: function(tab) {
    let selectedTab = this.selectedTab;
    if (selectedTab) {
      selectedTab.unselect();
    }
    this._selectedTab = tab;
    tab.select();
    this.selectedTabHasChanged();

    document.querySelector(".urlinput").focus();
  },

  getTabPosition: function(tab) {
    let children = document.querySelector(".tabstrip").children;
    return Array.indexOf(children, tab.dom);
  },

  getTabAt: function(idx) {
    let children = document.querySelector(".tabstrip").children;
    let dom = children[idx];
    for (let tab of this._tabs) {
      if (tab.dom === dom) {
        return tab;
      }
    }
    return null;
  },

  selectNextTab: function() {
    let idx = this.getTabPosition(this.selectedTab);
    idx++;
    if (idx >= this._tabs.size) {
      idx = 0;
    }
    this.selectTab(this.getTabAt(idx));
  },

  selectPreviousTab: function() {
    let idx = this.getTabPosition(this.selectedTab);
    idx--;
    if (idx < 0) {
      idx = this._tabs.size - 1;
    }
    this.selectTab(this.getTabAt(idx));
  },

  closeTab: function(tab) {
    if (this._tabs.size == 1) {
      return;
    }

    if (tab.isSelected) {
      let idx = this.getTabPosition(tab);
      idx++;
      if (idx >= this._tabs.size) {
        idx -= 2;
      }
      this.selectTab(this.getTabAt(idx));
    }

    tab.destroy();
    this._tabs.delete(tab);
  },

  preprocessUrlInput: function(input) {
    if (UrlHelper.isNotURL(input)) {
      return this._urlTemplate.replace('{searchTerms}', encodeURIComponent(input));
    }

    if (!UrlHelper.hasScheme(input)) {
      input = 'http://' + input;
    }

    return input;
  },
};

return gBrowser;
});

// Extend Iframe prototype

HTMLIFrameElement.prototype.show = function() {
  this.removeAttribute("hidden");
  if (IS_PRIVILEGED) {
    this.setVisible(true);
  }
}

HTMLIFrameElement.prototype.hide = function() {
  this.setAttribute("hidden", "true");
  if (IS_PRIVILEGED) {
    this.setVisible(false);
  }
}

// gBrowser

let gBrowser = {
  _tabs: new Set(),

  _selectedTab: null,

  get selectedTab() {
    return this._selectedTab;
  },

  urlInputChanged: function() {
    let urlinput = document.querySelector(".urlinput");
    let text = urlinput.value;
    this.selectedTab.iframe.src = text;
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
    urlinput.value = tab.location;

    if (!IS_PRIVILEGED) {
      return;
    }

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

  },

  addTab: function(url, select) {
    let tab = new Tab(url);
    this._tabs.add(tab);

    if (url && IS_PRIVILEGED) {
      tab.iframe.src = url;
    }

    document.querySelector(".iframes").appendChild(tab.iframe);
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
}

Cmds.createNewTab("http://paulrouget.com");

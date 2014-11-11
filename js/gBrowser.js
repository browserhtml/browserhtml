
// Operating System detection

window.IS_PRIVILEGED = !!HTMLIFrameElement.prototype.setVisible;

if (navigator.appVersion.indexOf("Win") >= 0) {
  window.OS = "windows";
  document.body.setAttribute("os", "windows");
}
if (navigator.appVersion.indexOf("Mac") >= 0) {
  window.OS = "osx";
  document.body.setAttribute("os", "osx");
}
if (navigator.appVersion.indexOf("X11") >= 0) {
  window.OS = "linux";
  document.body.setAttribute("os", "linux");
}

// Keybdings

window.addEventListener("keydown", e => {
  // console.log(e.keyCode);
  let end = () => {e.preventDefault(); e.stopPropagation()};

  if (e.keyCode == 27) {
    Cmds.navigation.stop();
    end();
  }

  if (e.keyCode == 9 && e.ctrlKey && !e.shiftKey) {
    Cmds.tabs.selectNextTab();
    end();
  }
  if (e.keyCode == 9 && e.ctrlKey && e.shiftKey) {
    Cmds.tabs.selectPreviousTab();
    end();
  }

  if (window.OS == "osx") {
    if (e.keyCode == 84 && e.metaKey) {
      Cmds.tabs.createNewTab();
      end();
    }
    if (e.keyCode == 82 && e.metaKey && !e.shiftKey) {
      Cmds.navigation.reload();
      end();
    }
    if (e.keyCode == 37 && e.metaKey) {
      Cmds.navigation.goBack();
      end();
    }
    if (e.keyCode == 39 && e.metaKey) {
      Cmds.navigation.goForward();
      end();
    }
    if (e.keyCode == 76 && e.metaKey) {
      Cmds.ui.focusURLBar();
      end();
    }
    if (e.keyCode == 75 && e.metaKey) {
      Cmds.ui.focusSearchBar();
      end();
    }
  }

  if (window.OS == "linux" || window.OS == "windows") {
    if (e.keyCode == 84 && e.ctrlKey) {
      Cmds.tabs.createNewTab();
      end();
    }
    if (e.keyCode == 82 && e.ctrlKey && !e.shiftKey) {
      Cmds.navigation.reload();
      end();
    }
    if (e.keyCode == 37 && e.altKey) {
      Cmds.navigation.goBack();
      end();
    }
    if (e.keyCode == 39 && e.altKey) {
      Cmds.navigation.goForward();
      end();
    }
  }
});

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
  _tabToIframe: new Map(),
  _iframeToTab: new Map(),

  getIframeForTab: function(tab) {
    return this._tabToIframe.get(tab);
  },

  getTabForIframe: function(iframe) {
    return this._iframeToTab.get(iframe);
  },

  get selectedTab() {
    return this._selectedTab;
  },

  get selectedIframe() {
    return this.getIframeForTab(this.selectedTab);
  },

  isTabSelected: function(tab) {
    return this._selectedTab === tab;
  },

  isIframeSelected: function(iframe) {
    return this.isTabSelected(this.getTabForIframe(iframe));
  },

  urlInputChanged: function() {
    let urlinput = document.querySelector(".urlinput");
    let text = urlinput.value;
    this.selectedIframe.src = text;
  },

  addTab: function(url) {
    let hbox = document.createElement("hbox");
    hbox.className = "tab";
    hbox.setAttribute("align", "center");
    hbox.onclick = () => gBrowser.selectTab(hbox);
    let throbber = document.createElement("div");
    throbber.className = "throbber";
    let favicon = document.createElement("img");
    favicon.className = "favicon";
    let title = document.createElement("hbox");
    title.className = "title";
    title.textContent = "xxx";
    let button = document.createElement("button");
    button.className = "close-button";
    hbox.appendChild(throbber);
    hbox.appendChild(favicon);
    hbox.appendChild(title);
    hbox.appendChild(button);
    document.querySelector(".tabstrip").appendChild(hbox);
    let iframe = document.createElement("iframe");
    iframe.setAttribute("mozbrowser", "true");
    iframe.setAttribute("flex", "1");
    iframe.setAttribute("remote", "true");
    if (url && IS_PRIVILEGED) {
      iframe.src = url;
    }
    this.trackIframe(iframe);
    // FIXME: don't add iframe if there's no url
    document.querySelector(".iframes").appendChild(iframe);
    iframe.hide();
    this._tabToIframe.set(hbox, iframe);
    this._iframeToTab.set(iframe, hbox);
    return hbox;
  },

  selectTab: function(tab) {
    if (this.selectedTab) {
      let iframe = this.selectedIframe;
      iframe.hide();
      this.selectedTab.classList.remove("selected");
    }
    let iframe = this.getIframeForTab(tab);
    iframe.show();
    iframe.focus();
    tab.classList.add("selected");
    this._selectedTab = tab;
    this.selectedIframeChanged("tabselected");
  },

  selectNextTab: function() {
    let sibling = this.selectedTab.nextElementSibling;
    if (sibling) {
      this.selectTab(sibling);
    }
  },

  selectPreviousTab: function() {
    if (!this.selectedTab) {
      return;
    }
    let sibling = this.selectedTab.previousElementSibling;
    if (sibling) {
      this.selectTab(sibling);
    }
  },

  closeTab: function(tab) {
    let iframe = this.getIframeForTab(tab);
    this._tabToIframe.delete(tab);
    this._iframeToTab.delete(tab);
    iframe.remove();
    tab.remove();
  },

  updateLoadStatus: function(iframe, loading) {
    let tab = this.getTabForIframe(iframe);
    tab.dataset.loading = loading;
    iframe.dataset.loading = loading;
  },

  updateTitle: function(iframe, title) {
    let tab = this.getTabForIframe(iframe);
    tab.dataset.title = title;
    iframe.dataset.title = title;
    tab.querySelector(".title").textContent = title;
  },

  updateLocation: function(iframe, location) {
    let tab = this.getTabForIframe(iframe);
    tab.dataset.location = location;
    iframe.dataset.location = location;
  },

  updateFavicon: function(iframe, faviconURL) {
    let tab = this.getTabForIframe(iframe);
    tab.dataset.faviconURL = faviconURL;
    iframe.dataset.faviconURL = faviconURL;

    let img = tab.querySelector(".favicon");
    console.log("faviconURL:", faviconURL);
    if (faviconURL) {
      img.src = faviconURL;
    } else {
      img.removeAttribute("src");
    }
  },

  selectedIframeChanged: function(reason) {
    let tab = this.selectedTab;
    let iframe = this.selectedIframe;

    document.title = "browser2: " + tab.dataset.title;;
    document.body.dataset.loading = tab.dataset.loading;
    document.body.dataset.title = tab.dataset.title;
    document.body.dataset.faviconURL = tab.dataset.faviconURL;

    if (tab.dataset.location) {
      document.body.dataset.location = tab.dataset.location;
    }

    /*
    let urlinput = document.querySelector(".urlinput");
    let isUrlInputFocus = document.activeElement === urlinput;
    if (!reason == "mozbrowserlocationchange" || !isUrlInputFocus) {
      urlinput.value = tab.dataset.location || "";
    }
    */

     if (!IS_PRIVILEGED) {
       return;
     }

    if (reason == "tabselected" || "mozbrowserlocationchange") {
      iframe.getCanGoBack().onsuccess = r => {
        // Make sure iframe is still selected
        if (!this.isIframeSelected(iframe)) {
          return;
        }
        if (r.target.result) {
          document.querySelector(".back-button").removeAttribute("disabled");
        } else {
          document.querySelector(".back-button").setAttribute("disabled", "true");
        }
      }
      iframe.getCanGoForward().onsuccess = r => {
        // Make sure iframe is still selected
        if (!this.isIframeSelected(iframe)) {
          return;
        }
        if (r.target.result) {
          document.querySelector(".forward-button").removeAttribute("disabled");
        } else {
          document.querySelector(".forward-button").setAttribute("disabled", "true");
        }
      }
    }
  },

  handleEvent: function(e) {
    let iframe = e.target;
    let somethingChanged = true;
    // console.log("event", e.type);
    switch(e.type) {
      case "mozbrowserloadstart":
        this.updateLoadStatus(iframe, true);
        break;
      case "mozbrowserloadend":
        this.updateLoadStatus(iframe, false);
        break;
      case "mozbrowsertitlechange":
        this.updateTitle(iframe, e.detail);
        break;
      case "mozbrowserlocationchange":
        this.updateLocation(iframe, e.detail);
        break;
      case "mozbrowsericonchange":
        this.updateFavicon(iframe, e.detail.href);
        break;
      case "mozbrowsererror":
        this.updateLoadStatus(iframe, false);
        break;
      default:
        somethingChanged = false;
    }
    if (somethingChanged && this.isIframeSelected(iframe)) {
      this.selectedIframeChanged(e.type);
    }
  },

  trackIframe: function(iframe) {
    let events = ["mozbrowserasyncscroll", "mozbrowserclose", "mozbrowsercontextmenu",
                  "mozbrowsererror", "mozbrowsericonchange", "mozbrowserloadend",
                  "mozbrowserloadstart", "mozbrowserlocationchange", "mozbrowseropenwindow",
                  "mozbrowsersecuritychange", "mozbrowsershowmodalprompt", "mozbrowsertitlechange",
                  "mozbrowserusernameandpasswordrequired"];
    for (let eventName of events) {
      iframe.addEventListener(eventName, this);
    }
  },
}

const Cmds = {

  navigation: {

    goBack: function() {
      gBrowser.selectedIframe.goBack();
    },
    goForward: function() {
      gBrowser.selectedIframe.goForward();
    },
    reload: function() {
      gBrowser.selectedIframe.reload();
    },
    stop: function() {
      gBrowser.selectedIframe.stop();
    },
  },

  tabs: {

    createNewTab: function(url) {
      let tab = gBrowser.addTab(url);
      gBrowser.selectTab(tab);
    },
    selectNextTab: function() {
      gBrowser.selectNextTab();
    },
    selectPreviousTab: function() {
      gBrowser.selectPreviousTab();
    },
  },

  ui: {
    focusURLBar: function() {
      document.querySelector(".urlinput").focus();
    },
    focusSearchBar: function() {
      document.querySelector(".searchinput").focus();
    },
  }
}

document.querySelector(".back-button").onclick = () => Cmds.navigation.goBack();
document.querySelector(".forward-button").onclick = () => Cmds.navigation.goForward();
document.querySelector(".reload-button").onclick = () => Cmds.navigation.reload();
document.querySelector(".stop-button").onclick = () => Cmds.navigation.stop();

let urlbar = document.querySelector(".urlbar");
let urlinput = document.querySelector(".urlinput");
urlinput.addEventListener("focus", () => urlbar.classList.add("focus"))
urlinput.addEventListener("blur", () => urlbar.classList.remove("focus"))
urlinput.addEventListener("keypress", (e) => {
  if (e.keyCode == 13) {
    gBrowser.urlInputChanged()
  }
});
let searchbar = document.querySelector(".searchbar");
let searchinput = document.querySelector(".searchinput");
searchinput.addEventListener("focus", () => searchbar.classList.add("focus"))
searchinput.addEventListener("blur", () => searchbar.classList.remove("focus"))

Cmds.tabs.createNewTab("http://paulrouget.com");

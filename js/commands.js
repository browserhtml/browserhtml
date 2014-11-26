// Commands. Used by keybindings and buttons.

const Cmds = {
  goBack: function() {
    if (gBrowser.selectedTab.hasIframe()) {
      gBrowser.selectedTab.iframe.goBack();
    }
  },
  goForward: function() {
    if (gBrowser.selectedTab.hasIframe()) {
      gBrowser.selectedTab.iframe.goForward();
    }
  },
  reload: function() {
    if (gBrowser.selectedTab.hasIframe()) {
      gBrowser.selectedTab.iframe.reload();
    }
  },
  stop: function() {
    if (gBrowser.selectedTab.hasIframe()) {
      gBrowser.selectedTab.iframe.stop();
    }
  },
  createNewTab: function(url) {
      gBrowser.addTab(url, true);
  },
  selectNextTab: function() {
      gBrowser.selectNextTab();
  },
  selectPreviousTab: function() {
    gBrowser.selectPreviousTab();
  },
  focusURLBar: function() {
    document.querySelector(".urlinput").focus();
    document.querySelector(".urlinput").select();
  },
  focusSearchBar: function() {
    document.querySelector(".searchinput").focus();
    document.querySelector(".searchinput").select();
  },
  closeTab: function() {
    gBrowser.closeTab(gBrowser.selectedTab);
  },
  zoomIn: function() {
    gBrowser.selectedTab.zoomIn();
  },
  zoomOut: function() {
    gBrowser.selectedTab.zoomOut();
  },
  resetZoom: function() {
    gBrowser.selectedTab.resetZoom();
  },
}

// Public API

const Cmds = {
  goBack: function() {
    gBrowser.selectedTab.iframe.goBack();
  },
  goForward: function() {
    gBrowser.selectedTab.iframe.goForward();
  },
  reload: function() {
    gBrowser.selectedTab.iframe.reload();
  },
  stop: function() {
    gBrowser.selectTab.iframe.stop();
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
  },
  focusSearchBar: function() {
    document.querySelector(".searchinput").focus();
  },
  closeTab: function() {
    gBrowser.closeTab(gBrowser.selectedTab);
  },
}

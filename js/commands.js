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
    gBrowser.selectedTab.iframe.stop();
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
}

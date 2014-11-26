// Keybindings

window.addEventListener("keydown", e => {
  let end = () => {e.preventDefault(); e.stopPropagation()};

  if (e.keyCode == 27) {
    Cmds.stop();
    end();
  }

  if (e.keyCode == 9 && e.ctrlKey && !e.shiftKey) {
    Cmds.selectNextTab();
    end();
  }
  if (e.keyCode == 9 && e.ctrlKey && e.shiftKey) {
    Cmds.selectPreviousTab();
    end();
  }

  if (window.OS == "osx") {
    if (e.keyCode == 84 && e.metaKey) {
      Cmds.createNewTab();
      end();
    }
    if (e.keyCode == 82 && e.metaKey && !e.shiftKey) {
      Cmds.reload();
      end();
    }
    if (e.keyCode == 37 && e.metaKey) {
      Cmds.goBack();
      end();
    }
    if (e.keyCode == 39 && e.metaKey) {
      Cmds.goForward();
      end();
    }
    if (e.keyCode == 76 && e.metaKey) {
      Cmds.focusURLBar();
      end();
    }
    if (e.keyCode == 75 && e.metaKey) {
      Cmds.focusSearchBar();
      end();
    }
    if (e.keyCode == 87 && e.metaKey) {
      Cmds.closeTab();
      end();
    }
    if (e.key == "+" && e.metaKey) {
      Cmds.zoomIn();
      end();
    }
    if (e.key == "=" && e.metaKey) {
      Cmds.zoomIn();
      end();
    }
    if (e.key == "-" && e.metaKey) {
      Cmds.zoomOut();
      end();
    }
    if (e.key == "0" && e.metaKey) {
      Cmds.resetZoom();
      end();
    }
  }

  if (window.OS == "linux" || window.OS == "windows") {
    if (e.keyCode == 84 && e.ctrlKey) {
      Cmds.createNewTab();
      end();
    }
    if (e.keyCode == 82 && e.ctrlKey && !e.shiftKey) {
      Cmds.reload();
      end();
    }
    if (e.keyCode == 37 && e.altKey) {
      Cmds.goBack();
      end();
    }
    if (e.keyCode == 39 && e.altKey) {
      Cmds.goForward();
      end();
    }
    if (e.keyCode == 76 && e.ctrlKey) {
      Cmds.focusURLBar();
      end();
    }
    if (e.keyCode == 75 && e.ctrlKey) {
      Cmds.focusSearchBar();
      end();
    }
    if (e.keyCode == 87 && e.ctrlKey) {
      Cmds.closeTab();
      end();
    }
    if (e.key == "+" && e.ctrlKey) {
      Cmds.zoomIn();
      end();
    }
    if (e.key == "=" && e.ctrlKey) {
      Cmds.zoomIn();
      end();
    }
    if (e.key == "-" && e.ctrlKey) {
      Cmds.zoomOut();
      end();
    }
    if (e.key == "0" && e.ctrlKey) {
      Cmds.resetZoom();
      end();
    }
  }
});


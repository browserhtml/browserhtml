// Keybindings

(function() {

  let allKeyBindings = [];

  RegisterKeyBindings(
    ["",              "Esc",        "stop"],
    ["Ctrl",          "Tab",        "selectNextTab"],
    ["Ctrl Shift",    "code:9",     "selectPreviousTab"]
  );

  if (window.OS == "linux" || window.OS == "windows") {
    RegisterKeyBindings(
      ["Ctrl",          "t",          "createNewTab"],
      ["Ctrl",          "r",          "reload"],
      ["Alt",           "Left",       "goBack"],
      ["Alt",           "Right",      "goForward"],
      ["Ctrl",          "l",          "focusURLBar"],
      ["Ctrl",          "k",          "focusSearchBar"],
      ["Ctrl",          "w",          "closeTab"],
      ["Ctrl Shift",    "+",          "zoomIn"],
      ["Ctrl",          "=",          "zoomIn"],
      ["Ctrl",          "-",          "zoomOut"],
      ["Ctrl",          "0",          "resetZoom"]
    );
  }

  if (window.OS == "osx") {
    RegisterKeyBindings(
      ["Cmd",       "t",          "createNewTab"],
      ["Cmd",       "r",          "reload"],
      ["Cmd",       "Left",       "goBack"],
      ["Cmd",       "Right",      "goForward"],
      ["Cmd",       "l",          "focusURLBar"],
      ["Cmd",       "k",          "focusSearchBar"],
      ["Cmd",       "w",          "closeTab"],
      ["Cmd Shift", "+",          "zoomIn"],
      ["Cmd",       "=",          "zoomIn"],
      ["Cmd",       "-",          "zoomOut"],
      ["Cmd",       "0",          "resetZoom"]
    );
  }

  function RegisterKeyBindings(...bindings) {
    for (let b of bindings) {
      let mods = b[0];
      let key = b[1];
      let func = b[2];

      let e = {
        ctrlKey: false,
        shiftKey: false,
        metaKey: false,
        altKey: false
      }

      if (mods.indexOf("Ctrl") > -1) e.ctrlKey = true;
      if (mods.indexOf("Shift") > -1) e.shiftKey = true;
      if (mods.indexOf("Alt") > -1) e.altKey = true;
      if (mods.indexOf("Cmd") > -1) e.metaKey = true;

      if (key.indexOf("code:") > -1) {
        e.keyCode = key.split(":")[1];
      } else {
        e.key = key;
      }
      allKeyBindings.push({event:e,func:func});
    }
  }

  window.addEventListener("keypress", e => {
    for (let oneKeyBinding of allKeyBindings) {
      let matches = true;
      for (let prop in oneKeyBinding.event) {
        if (e[prop] != oneKeyBinding.event[prop]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        Cmds[oneKeyBinding.func]();
      }
    }
  });
})();

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * app.js
 *
 * Firefox.html entry point.
 *
 */

require.config({
  scriptType: 'text/javascript;version=1.8',
  paths: {
    "react": "lib/react/react@0.12.1"
  },
  shim: {
    "react": {
      exports: "React"
    }
  }
});


window.OS = navigator.appVersion.contains('Win') ? "windows" :
            navigator.appVersion.contains("Mac") ? "osx" :
            navigator.appVersion.contains("X11") ? "linux" :
            "unknown";
require(['js/component', 'js/browser'], ({render}, {Browser}) => {
  // IS_PRIVILEGED is false if Firefox.html runs in a regular browser,
  // with no Browser API.
  render(Browser({
    version: "0.0.2",
    isPrivileged: !!HTMLIFrameElement.prototype.setVisible,
    // Detect Operating System
    OS: window.OS,
    // Change theme value to "dark" to enable dark theme.
    theme: "bright",
    // You can enable side tabs by changing `tabStyle` below
    // from "horizontal" to "vertical".
    tabStyle: "horizontal",
  }), document.body);
});

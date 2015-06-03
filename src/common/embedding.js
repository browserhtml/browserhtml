/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Manages events coming from gecko.

define((require, exports, module) => {
  'use strict';

  // Actions

  function SystemAction(detail, bubbles=true, cancelable=false) {
    if (this instanceof SystemAction) {
      this.detail = detail
      this.type = detail.type
      this.bubbles = bubbles
      this.cancelable = cancelable
    } else {
      return new SystemAction(detail, bubbles, cancelable)
    }
  }

  SystemAction.prototype = {
    constructor: SystemAction,
    get dispatch() {
      return () =>
        window.dispatchEvent(new CustomEvent('mozContentEvent', this));
    }
  };


  exports.SystemAction = SystemAction;

  // Update

  exports.update = (state, action) => {
    if (action.constructor === SystemAction) {
      action.dispatch();
    }
    return state;
  }


  // Setup

  const handleEvent = event => {
    const {type} = event.detail;
    switch (type) {
      case 'remote-debugger-prompt':
        // Always allow remote debugging for now.
        return SystemAction({
          type: 'remote-debugger-prompt',
          value: true
        }).dispatch();
      case 'update-available':
        // Always download updates.
        return SystemAction({
          type: 'update-available-result',
          result: 'download'
        }).dispatch();
      case 'update-downloaded':
      case 'update-prompt-apply':
        return dispatchEvent(new CustomEvent('runtime-update-available'));
      default:
        console.log(`Unknown mozChromeEvent: ${type}`, event);
    }
  };

  window.addEventListener('mozChromeEvent', handleEvent);

  // Refresh on devtools just load a page but we need to clear the cache in order
  // to pick up file changes. There for we dispatch special gecko event to clear
  // the cache.
  window.addEventListener('unload', SystemAction({
    type: 'clear-cache-and-reload'
  }).dispatch);


  // Trigger a forced update check after 5s to not slow down startup.
  // TODO: delay until we're online if needed.
  window.setTimeout(SystemAction({
    type: 'force-update-check'
  }).dispatch, 5000);
});

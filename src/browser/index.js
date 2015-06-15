/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const {main} = require('reflex');
  const Browser = require('./browser');
  const {appUpdateAvailable} = require('./github');
  const Session = require('./session');

  console.log(Browser)

  const app = main(document.body,
                   Session.update(Browser.Model(),
                                  Session.Action.RestoreSession()),
                   Browser.update,
                   Browser.view);

  window.app = app;

  appUpdateAvailable.then(() => {
    dispatchEvent(new CustomEvent('app-update-available'));
  }, () => {
    console.log('Not checking for updates');
  });

});

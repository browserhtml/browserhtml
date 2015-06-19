/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const {Application, Address} = require('reflex');
  const Browser = require('./browser');
  const Thumbnail = require('service/thumbnail');
  const Pallet = require('service/pallet');
  const {appUpdateAvailable} = require('./github');
  const Session = require('./session');

  // Set up a address (message bus if you like) that will be used
  // as an address for all application components / services. This
  // address is going to receive action and then pass it on to each
  // application component for it handle it.
  const address = new Address({
    receive(action) {
      application.receive(action);
      thumbnail(action);
      pallet(action);
    }
  });
  window.address = address;

  const application = new Application({
    target: document.body,
    state: Browser.Model(),
    update: Browser.update,
    view: Browser.view,
    address: address
  });
  window.application = application;

  const thumbnail = Thumbnail.service(address);
  const pallet = Pallet.service(address);
  // const updater = UpdateService(address);
  // const session = Session.service(address);


  appUpdateAvailable.then(() => {
    dispatchEvent(new CustomEvent('app-update-available'));
  }, () => {
    console.log('Not checking for updates');
  });

  // Start things up.
  address.receive(Session.Action.RestoreSession());
});

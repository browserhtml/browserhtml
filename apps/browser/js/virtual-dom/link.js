/* this source code form is subject to the terms of the mozilla public
 * license, v. 2.0. if a copy of the mpl was not distributed with this
 * file, you can obtain one at http://mozilla.org/mpl/2.0/. */

define((require, exports, module) => {
  "use strict";

  const {Element, Event} = require("js/element");

  // Define custom Link element that supports load event
  // listeners.
  const Link = Element("link", {
    onLoad: Event("load")
  });
  exports.Link = Link;

});

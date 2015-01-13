/* this source code form is subject to the terms of the mozilla public
 * license, v. 2.0. if a copy of the mpl was not distributed with this
 * file, you can obtain one at http://mozilla.org/mpl/2.0/. */

define((require, exports, module) => {
  "use strict";

  const {Component} = require("js/component");
  const {html} = require("js/virtual-dom");

  const Theme = Component({
    render({name}) {
      return html.link({rel: "stylesheet",
                        // TODO: Organize themes better that this.
                        href: `css/${name}/${name}.css`});
    }
  });

  exports.Theme = Theme;
});

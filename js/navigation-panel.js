/* this source code form is subject to the terms of the mozilla public
 * license, v. 2.0. if a copy of the mpl was not distributed with this
 * file, you can obtain one at http://mozilla.org/mpl/2.0/. */

define((require, exports, module) => {
  "use strict";

  const {KeyBindings} = require("js/keyboard");
  const {Component} = require("js/component");
  const {html} = require("js/virtual-dom");
  const urlHelper = require("js/urlhelper");

  const makeSearchURL = input =>
    `https://search.yahoo.com/search?p=${encodeURIComponent(input)}`;
  exports.makeSearchURL = makeSearchURL;

  const readInputURL = input =>
    urlHelper.isNotURL(input) ? makeSearchURL(input) :
    !urlHelper.hasScheme(input) ? `http://${input}` :
    input;
  exports.readInputURL = readInputURL;

  const NavigationPanel = Component({
    displayName: "NavigationPanel",
    mixins: [KeyBindings.make("keysPressed",
                              {"@meta l": "focusInput",
                               "@meta k": "focusSearch"})],
    equal(before, after) {
      return before.input == after.input &&
             before.search == after.search &&
             before.frame == after.frame;
    },

    patch({input, frame, search}) {
      if (input) {
        this.props.resetInput(Object.assign({}, this.props.input, input));
      }

      if (search) {
        this.props.resetSearch(Object.assign({},
                                             this.props.search,
                                             search));
      }

      if (frame) {
        this.props.resetFrame(Object.assign({},
                                            this.props.frame,
                                            frame));
      }
    },

    navigateBack() {
      this.patch({frame: {action: "goBack"}});
    },
    navigateForward() {
      this.patch({frame: {action: "goForward"}});
    },
    reload() {
      this.patch({frame: {action: "reload"}});
    },
    stop() {
      this.patch({frame: {action: "stop"}});
    },

    updateInput(input) {
      this.patch({frame: {input}});
    },
    updateURL(url) {
      this.patch({frame: {url}});
    },
    navigateTo(input) {
      if (input) {
        this.patch({frame: {input: null,
                            focused: true,
                            url: readInputURL(input)}});
      }
    },
    focusInput() {
      this.patch({input: {focused: true},
                  frame: {focused: false}});
    },
    focusSearch() {
      this.patch({search: {focused: true},
                  frame: {focused: false}});
    },


    onInputChange(event) {
      this.patch({frame: {input: event.target.value}});
    },

    onInputKey(event) {
      if (event.keyCode === 13) {
        this.navigateTo(this.props.frame.input);
      }
    },
    onInputFocus() {
      this.patch({input: {focused: true}});
    },
    onInputBlur() {
      this.patch({input: {focused: false}});
    },

    onSearchKey(event) {
      if (event.keyCode === 13) {
        this.navigateTo(this.props.search.query);
      }
    },
    onSearchChange(event) {
      this.patch({search: {query: event.target.value}});
    },
    onSearchFocus() {
      this.patch({search: {focused: true}});
    },
    onSearchBlur() {
      this.patch({search: {focused: false}});
    },

    // Focus and selection management can not be expressed declaratively
    // at least not with reacts virtual dom. There for focus management
    // and selection management is handled manually post update.
    write(target, after, before) {
      if (after.input.focused && !before.input.focused) {
        const node = target.querySelector(".urlinput");
        node.focus();
        node.select();
      }

      if (after.search.focused && !before.search.focused) {
        const node = target.querySelector(".searchinput");
        node.focus();
        node.select();
      }
    },
    render({frame, input, search}) {
      const classList = [
        "navbar", "toolbar", "hbox", "align", "center",
        frame && frame.loading ? "loading" : "loaded",
        frame && frame.securityState == "secure" ? "ssl" : "",
        frame && frame.securityExtendedValidation ? "sslev" : ""
      ];

      return html.div({
        className: classList.join(" ")
      }, [
        html.link({"rel": "stylesheet",
                   "href": "css/navbar.css"}),
        html.button({
          key: "back-button",
          title: "Go back one page",
          className: ["back-button",
                      frame && frame.canGoBack ? "" : "disabled"].join(" "),
          onClick: this.navigateBack
        }),
        html.button({
          key: "forward-button",
          title: "Go forward one page",
          className: ["forward-button",
                      frame && frame.canGoForward ? "" : "disabled"].join(" "),
          onClick: this.navigateForward
        }),
        html.button({
          key: "reload-button",
          title: "Reload current page",
          className: "reload-button",
          onClick: this.reload
        }),
        html.button({
          key: "stop-button",
          title: "Stop loading this page",
          className: "stop-button",
          onClick: this.stop
        }),
        html.div({
          key: "url-bar",
          className: "urlbar hbox flex-1 align center" +
                     (input.focused ? " focus" : "")
        }, [
          html.div({key: "identity",
                    className: "identity"}),
          html.input({key: "url-input",
                      className: "urlinput flex-1",
                      value: frame && (frame.input !== null ? frame.input : frame.url),
                      placeholder: "Search or enter address",
                      tabIndex: 0,
                      autoFocus: true,
                      contextMenu: "url-context-menu",

                      onClick: this.focusInput,
                      onChange: this.onInputChange,
                      onKeyDown: this.onInputKey,
                      onFocus: this.onInputFocus,
                      onBlur: this.onInputBlur}),
          html.menu({
            key: "url-context-menu",
            type: "context",
            id: "url-context-menu",
          }, [
            html.menuitem({
              key: "undo",
              label: "Undo",
              onClick() {
                alert("Undo")
              }
            }),
            html.menuitem({
              key: "cut",
              label: "Cut",
            }),
            html.menuitem({
              key: "copy",
              label: "Copy",
            }),
            html.menuitem({
              key: "paste",
              label: "Paste",
            }),
            html.menuitem({
              key: "paste-&-go",
              label: "Paste & Go",
            }),
            html.menuitem({
              key: "select-all",
              label: "Select All",
            })
          ])
        ]),
        html.div({
          key: "search-bar",
          className: "searchbar hbox flex-1 align center" +
                     (search.focused ? " focus" : "")
        }, [
          html.div({key: "search-selector",
                    className: "searchselector"}),
          html.input({key: "search-input",
                      className: "searchinput",
                      value: search.query,
                      placeholder: "Yahoo",

                      onClick: this.focusSearch,
                      onChange: this.onSearchChange,
                      onKeyDown: this.onSearchKey,
                      onFocus: this.onSearchFocus,
                      onBlur: this.onSearchBlur})
        ]),
        html.button({key: "menu-button",
                     className: "menu-button"})
      ]);
    }
  });
  exports.NavigationPanel = NavigationPanel;
});

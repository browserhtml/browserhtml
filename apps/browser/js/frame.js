/* this source code form is subject to the terms of the mozilla public
 * license, v. 2.0. if a copy of the mpl was not distributed with this
 * file, you can obtain one at http://mozilla.org/mpl/2.0/. */

define((require, exports, module) => {
  "use strict";

  const {Component} = require("js/component");
  const {html} = require("js/virtual-dom");
  const {Element, Option, Attribute, Field, Event } = require("js/element");

  const IFrame = Element("iframe", {
    remote: Option("remote"),
    browser: Option("mozbrowser"),
    allowFullScreen: Option("mozallowfullscreen"),
    flex: Attribute("flex"),
    location: Field((node, current, past) => {
      if (current != past) {
        // React batches updates on animation frame which
        // seems to trigger a bug in mozbrowser causing it
        // to load previous location instead of current one.
        // To workaround that we delay `src` update.
        setTimeout(() => node.src = current);
      }
    }),
    hidden: Field((node, current, past) => {
      if (current) {
        node.setAttribute("hidden", true);
        node.setVisible(false);
      } else if (past) {
        node.removeAttribute("hidden");
        node.setVisible(true);
      }
    }),
    zoom: Field((node, current, past) => {

      if (current != past) {
        node.zoom(current);
      }
    }),
    focused: Field((node, current, past) => {
      if (current) {
        node.focus();
      }
    }),
    onAsyncScroll: Event("mozbrowserasyncscroll"),
    onClose: Event("mozbrowserclose"),
    onOpenWindow: Event("mozbrowseropenwindow"),
    onContextMenu: Event("mozbrowsercontextmenu"),
    onError: Event("mozbrowsererror"),
    onLoadStart: Event("mozbrowserloadstart"),
    onLoadEnd: Event("mozbrowserloadend"),
    onIconChange: Event("mozbrowsericonchange"),
    onLocationChange: Event("mozbrowserlocationchange"),
    onSecurityChange: Event("mozbrowsersecuritychange"),
    onTitleChange: Event("mozbrowsertitlechange"),
    onPrompt: Event("mozbrowsershowmodalprompt"),
    onAuthentificate: Event("mozbrowserusernameandpasswordrequired")
  });

  const Frame = Component({
    displayName: "Frame",
    defaults() {
      return {
        zoom: 1,
        loading: false,
        focused: false,
        input: null,
        url: null,
        title: null,
        favicon: null,
        securityState: "insecure",
        securityExtendedValidation: false,
        canGoBack: false,
        canGoForward: false
      };
    },

    patch(diff) {
      this.props.reset(Object.assign({}, this.props, diff));
    },

    // Events
    onScroll() {
    },
    onAuthentificate() {
    },
    onOpen({detail}) {
      if (this.props.open) {
        this.props.open({url: detail});
      }
    },
    onClose() {
      if (this.props.close) {
        this.props.close(this.props);
      }
    },
    onContextMenu() {
    },
    onError(event) {
      console.error(event);
      this.patch({loading: false});
    },
    onSecurityChange() {
    },
    onPrompt() {
    },
    onLoadStart(event) {
      this.patch({loading: true,
                  favicon: null,
                  title: null,
                  securityState: "insecure",
                  securityExtendedValidation: false,
                  canGoBack: false,
                  canGoForward: false});
    },
    onLoadEnd(event) {
      this.patch({loading: false});
    },
    onTitleChange({detail}) {
      this.patch({title: detail});
    },
    onLocationChange({detail}) {
      this.patch({url: detail, input: null});
    },
    onIconChange({detail}) {
      this.patch({favicon: detail.href});
    },

    onCanGoBack({target: {result}}) {
      this.patch({canGoBack: result});
    },
    onCanGoForward({target: {result}}) {
      this.patch({canGoForward: result});
    },

    onFocus() {
      this.patch({focused: true});
    },
    onBlur() {
      this.patch({focused: false});
    },
    onAction({target, action}) {
      if (!target) return;
      if (action === "reload") {
        target.reload();
      }
      if (action === "goBack") {
        target.goBack();
      }
      if (action === "goForward") {
        target.goForward();
      }
      if (action === "stop") {
        target.stop();
      }

      this.patch({action: null});
    },

    write(target, {loading, action}, past) {
      if (loading != past.loading) {
        target.getCanGoBack().onsuccess = this.onCanGoBack;
        target.getCanGoForward().onsuccess = this.onCanGoForward;
      }

      if (action && action != past.action) {
        this.onAction({target, action});
      }
    },
    render({id, url, selected, zoom, focused}) {
      // Do not render frame if there is no url to load.
      if (!url) return null;
      return IFrame({className: "frame box flex-1",
                     key: `frame-${id}`,
                     hidden: !selected,
                     remote: true,
                     browser: true,
                     allowFullScreen: true,
                     flex: 1,
                     zoom, focused,
                     location: url,

                     onBlur: this.onBlur,
                     onFocus: this.onFocus,
                     onAsyncScroll: this.onScroll,
                     onClose: this.onClose,
                     onOpenWindow: this.onOpen,
                     onContextMenu: this.onContextMenu,
                     onError: this.onError,
                     onLoadStart: this.onLoadStart,
                     onLoadEnd: this.onLoadEnd,
                     onIconChange: this.onIconChange,
                     onLocationChange: this.onLocationChange,
                     onSecurityChange: this.onSecurityChange,
                     onTitleChange: this.onTitleChange,
                     onPrompt: this.onPrompt,
                     onAuthentificate: this.onAuthentificate
                    });
    }
  });

  // Frame transformations.

  Frame.reload = frame =>
    Object.assign({}, frame, {action: "reload"});

  Frame.stop = frame =>
    Object.assign({}, frame, {action: "stop"});

  Frame.goBack = frame =>
    Object.assign({}, frame, {action: "goBack"});

  Frame.goForward = frame =>
    Object.assign({}, frame, {action: "goForward"});


  Frame.MIN_ZOOM = 0.5;
  Frame.MAX_ZOOM = 2;

  Frame.zoomIn = frame =>
    Object.assign({}, frame, {zoom: Math.min(Frame.MAX_ZOOM,
                                             frame.zoom + 0.1)});

  Frame.zoomOut = frame =>
    Object.assign({}, frame, {zoom: Math.max(Frame.MIN_ZOOM,
                                             frame.zoom - 0.1)});

  Frame.resetZoom = frame =>
    Object.assign({}, frame, {zoom:1});


  exports.Frame = Frame;
});

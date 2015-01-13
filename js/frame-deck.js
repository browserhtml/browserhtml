/* this source code form is subject to the terms of the mozilla public
 * license, v. 2.0. if a copy of the mpl was not distributed with this
 * file, you can obtain one at http://mozilla.org/mpl/2.0/. */

define((require, exports, module) => {
  "use strict";

  const {Component} = require("js/component");
  const {html}  = require("js/virtual-dom");
  const {Frame} = require("js/frame");
  const {KeyBindings} = require("js/keyboard");

  const FrameDeck = Component({
    displayName: "FrameDeck",
    mixins: [KeyBindings.make("keysPressed", {
      "alt left": "goBack",
      "alt right": "goForward",
      "esc": "stop",
      "@meta r": "reload",
      "F5": "reload",

      "@meta t": "open",
      "@meta w": "close",
      "ctrl tab": "selectNext",
      "ctrl shift tab": "selectPrevious",
      "meta shift ]": "selectNext",
      "meta shift [": "selectPrevious",

      "@meta shift +": "zoomIn",
      "@meta =": "zoomIn",
      "@meta -": "zoomOut",
      "@meta 0": "resetZoom",

      "@meta shift backspace": "clearSession",
      "@meta shift s": "saveSession"
    })],
    zoomIn() {
      this.props.resetFrame(Frame.zoomIn(this.props.selected));
    },
    zoomOut() {
      this.props.resetFrame(Frame.zoomOut(this.props.selected));
    },
    resetZoom() {
      this.props.resetFrame(Frame.resetZoom(this.props.selected));
    },

    selectNext() {
      const { selectFrame, frames, selected } = this.props;
      const index = frames.indexOf(selected);
      const frame = frames[index + 1] || frames[0];
      selectFrame(frame);
    },
    selectPrevious() {
      const { selectFrame, frames, selected } = this.props;
      const index = frames.indexOf(selected);
      const frame = frames[index - 1] || frames[frames.length - 1];
      selectFrame(frame);
    },
    reload() {
      this.props.resetFrame(Frame.reload(this.props.selected));
    },
    stop() {
      this.props.resetFrame(Frame.stop(this.props.selected));
    },
    goBack() {
      this.props.resetFrame(Frame.goBack(this.props.selected));
    },
    goForward() {
      this.props.resetFrame(Frame.goForward(this.props.selected));
    },

    open(options={selected: true}) {
      this.props.addFrame(options);
    },
    close(frame=this.props.selected) {
      this.props.removeFrame(frame);
    },
    reset(frame) {
      this.props.resetFrame(frame);
    },
    clearSession() {
      this.props.clearSession();
    },
    saveSession() {
      this.props.saveSession();
    },

    renderFrame(frame) {
      const {open, close, reset} = this;
      const {isPrivileged} = this.props;
      const options = Object.assign({}, frame, {
        open, close, reset, isPrivileged, key: `frame-${frame.id}`
      });
      return Frame(options);
    },
    render({frames}) {
      return html.div({className: "frame-deck iframes box flex-1 align stretch",
                       key: "frame-deck"},
                       frames.map(this.renderFrame));
    }
  });

  exports.FrameDeck = FrameDeck;
});

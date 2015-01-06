/* this source code form is subject to the terms of the mozilla public
 * license, v. 2.0. if a copy of the mpl was not distributed with this
 * file, you can obtain one at http://mozilla.org/mpl/2.0/. */

define((require, exports, module) => {
  "use strict";

  const {Component} = require("js/component");
  const {html} = require("js/virtual-dom");
  const {FrameDeck} = require("js/frame-deck");
  const {TabNavigator} = require("js/tab-navigator");
  const {NavigationPanel} = require("js/navigation-panel");
  const {Keyboard} = require("js/keyboard");
  const {Theme} = require("js/theme");

  const focusInput = input =>
    Object.assign({}, input, {focused: true});

  const blurInput = input =>
    Object.assign({}, input, {focused: false});


  const SelectFrame = frame =>
    Object.assign({}, frame, {selected: true,
                              focused: true});
  const DeselectFrame = frame =>
    Object.assign({}, frame, {selected: false,
                              focused: false});

  const selectedFrame = frames =>
    frames.find(({selected}) => selected);

  const selectFrame = (frames, id) =>
    frames.map(frame =>
               frame.selected && frame.id != id ? DeselectFrame(frame) :
               !frame.selected && frame.id == id ? SelectFrame(frame) :
               frame);

  const makeFrame = (id, state) =>
    Object.assign({}, state, {id});

  const Browser = Component({
    displayName: "Browser",
    mixins: [Keyboard],
    defaults() {
      return Object.assign({
        isPrivileged: true,
        frameID: 0,
        frames: [{id: 0,
                  selected: true,
                  focused: true,
                  url: "https://github.com/mozilla/browser.html"}],
        input: {focused: false},
        search: {focused: false, query: ""},
      }, Keyboard.keyboardDefaults());
    },
    selectFrame({id}) {
      const frames = selectFrame(this.props.frames, id);
      const selected = selectFrame(frames);
      // If frame does not has a URL it won't be created neither loaded
      // in that case focus an input.
      if (selected.url) {
        this.patch({frames: frames});
      } else {
        this.patch({frames: frames, input: {focused: true}});
      }
    },
    addFrame(options) {
      const {props} = this;
      const frameID = props.frameID + 1;
      const frames = [...props.frames];
      const selected = frames.find(({selected}) => selected);
      const frame = makeFrame(frameID, options);
      frames.splice(frames.indexOf(selected), 1,
                    frame.selected ? DeselectFrame(selected) : selected,
                    frame);

      this.patch({frameID, frames,
                  input: focusInput(props.input)});
    },
    removeFrame({id}) {
      const {props} = this;
      const frames = [...props.frames];
      // Abort if only one frame left.
      if (frames.length > 1) {
        const index = frames.findIndex(frame => frame.id == id);
        frames.splice(index, 1);
        const selected = frames[index] || frames[frames.length - 1];
        this.patch({frames: selectFrame(frames, selected.id)});
      }
    },
    resetFrame(state) {
      const {frames} = this.props;
      const swapFrame = frame =>
        frame.id === state.id ? state : frame;

      this.patch({frames: frames.map(swapFrame)});
    },

    resetInput(state) {
      this.patch({input: state});
    },
    resetSearch(state) {
      this.patch({search: state});
    },

    serializeSession() {
      const session = Object.assign({}, this.props);
      const defaults = this.defaults();

      delete session.theme;
      delete session.OS;
      delete session.theme;
      delete session.tabStyle;

      return JSON.stringify(session);
    },
    clearSession() {
      localStorage.removeItem("session");
      this.restoreSession();
    },
    saveSession() {
      localStorage.setItem("session", this.serializeSession());
    },
    restoreSession() {
      const data = localStorage.getItem("session");
      const session = data && JSON.parse(data);
      if (session && session.version === this.props.version) {
        this.patch(session);
      }
      else if (session) {
        const backup = `session@${session.version}`;
        localStorage.setItem(backup, data);
        console.error(`Stored session ${session.version} version is incompatible with current ${this.props.version} version.
Backing up stored session to ${backup} & resuming with blank session instead.`);
      }
    },

    mounted(target, options) {
      target.ownerDocument.defaultView.addEventListener("beforeunload", this.onUnload);
      target.ownerDocument.body.setAttribute("os", options.OS);
      this.restoreSession();
    },
    onUnload(event) {
      this.saveSession();
    },
    render(options) {
       const {frames, input, search, keysPressed,
              isPrivileged, theme, tabStyle} = options;
       //console.log(options)
       const frame = frames.find(frame => frame.selected);

        // TODO: At the moment tabNavigator is inserted in
        // different location in the tree depending on style
        // tabs rendered. This is not ideal and should be
        // handled purely by styling in a future.
       const tabNavigator = TabNavigator({
         key: "tab-navigator",
         frames, tabStyle,
         addTab: this.addFrame,
         closeTab: this.removeFrame,
         selectTab: this.selectFrame
       });

       return html.div({id: "outervbox",
                        className: "vbox flex-1",
                        onUnload: this.onUnload,
                        onBlur: this.onBlur,
                        onKeyDown: this.onKeyDown,
                        onKeyUp: this.onKeyUp}, [

          Theme({name: theme}),

          ...(tabStyle != "vertical" ? [tabNavigator] : []),

          NavigationPanel({
            key: "navigation-panel",
            frame, input, search, keysPressed,
            resetFrame: this.resetFrame,
            resetInput: this.resetInput,
            resetSearch: this.resetSearch,
          }),

          html.div({className: "hbox flex-1",
                    key: "frame-deck",
                    id: "outerhbox"}, [

            FrameDeck({
              key: "deck",
              selected: frame,
              frames, keysPressed,
              isPrivileged,
              addFrame: this.addFrame,
              removeFrame: this.removeFrame,
              resetFrame: this.resetFrame,
              selectFrame: this.selectFrame,
              clearSession: this.clearSession,
              saveSession: this.saveSession
            }),

            ...(tabStyle == "vertical" ? [tabNavigator] : []),
          ]),
          html.div({key: "tab-curve",
                    hidden: "true",
                    className: "dummy-tab-curve"})
        ]);
    }
  });

  exports.Browser = Browser;
});

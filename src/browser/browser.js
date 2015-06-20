/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const {html, node, render, reframe} = require('reflex');
  const {Record, Any, Union} = require('common/typed');
  const {inspect} = require('common/debug');
  const WindowBar = require('./window-bar');
  const WebViews = require('./web-view-deck');
  const Theme = require('./theme');
  const {KeyBindings} = require('common/keyboard');
  const Focusable = require('common/focusable');
  const {Main} = require('./main');
  const Updates = require('./update-banner');
  const WebView = require('./web-view');
  const Session = require('./session');
  const Input = require('./web-input');
  const Previews = require('./preview-box');
  const ClassSet = require('common/class-set');
  const OS = require('common/os');
  const Pallet = require('service/pallet');
  const Suggestions = require('./suggestion-box');

  // Model
  const Model = Record({
    version: '0.0.7',
    previews: Previews.Model,
    shell: Focusable.Model({isFocused: true}),
    updates: Updates.Model,
    webViews: WebViews.Model,
  });
  exports.Model = Model;

  // Actions

  const {SaveSession, ResetSession, RestoreSession} = Session.Action;
  const {Focus, Blur} = Focusable.Action;
  const {ApplicationUpdate, RuntimeUpdate} = Updates.Action;
  const {EnterInput} = WebView.Action;

  const modifier = OS.platform() == 'linux' ? 'alt' : 'accel';
  const Binding = KeyBindings({
    'accel l': Input.Action.Enter,
    'accel t': _ => Input.Action.Enter({id: 'about:dashboard'}),
    'accel 0': WebView.Action.Shell.ResetZoom,
    'accel -': WebView.Action.Shell.ZoomOut,
    'accel =': WebView.Action.Shell.ZoomIn,
    'accel shift =': WebView.Action.Shell.ZoomIn,
    'accel w': WebViews.Action.Close,
    'accel shift ]': _ => WebViews.Action.SelectByOffset({offset: 1}),
    'accel shift [': _ => WebViews.Action.SelectByOffset({offset: -1}),

    'accel shift backspace': ResetSession,
    'accel shift s': SaveSession,

    'F5': WebView.Action.Navigation.Reload,
    'accel r': WebView.Action.Navigation.Reload,
    'escape': WebView.Action.Navigation.Stop,
    [`${modifier} left`]: WebView.Action.Navigation.GoBack,
    [`${modifier} right`]: WebView.Action.Navigation.GoForward
  }, 'Browser.Keyboard.Action');

  const Action = Union({
    Binding: Binding.Action,
    Updates: Updates.Action,
    WebViews: WebViews.Action,
    Focusable: Focusable.Action,
    Previews: Previews.Action,
    Session: Session.Action,
    Suggestions: Suggestions.Action
  });
  exports.Action = Action;



  // Update

  const update = (state, action) => {
      if (action instanceof Previews.Action.Deactivate) {
      return state.merge({
        previews: Previews.update(state.previews, action),
        webViews: WebViews.update(state.webViews,
                                  WebViews.Action.PreviewByID({
                                    id: '@selected'
                                  }))
      });
    }

    if (Focusable.Action.isTypeOf(action)) {
      return state.set('shell', Focusable.update(state.shell, action));
    }

    if (WebViews.Action.isTypeOf(action)) {
      return state.set('webViews', WebViews.update(state.webViews, action));
    }

    if (Updates.Action.isTypeOf(action)) {
      return state.set('updates', Updates.update(state.updates, action));
    }

    if (Previews.Action.isTypeOf(action)) {
      return state.set('previews', Previews.update(state.previews, action));
    }

    if (Session.Action.isTypeOf(action)) {
      return Session.update(state, action);
    }

    return state
  }
  exports.update = update;


  exports.update = inspect(update, ([state, action], output) => {
    if (action instanceof WebView.Action.Progress.LoadProgress) {
      return null;
    }

    console.log(action.toString(),
                state.toJSON(),
                output && output.toJSON());
  });


  // View

  const OpenWindow = event => WebView.Open({uri: event.detail.url});

  const view = (state, address) => {
    const {shell, webViews} = state;
    const selected = webViews.entries.get(webViews.selected);
    const previewed = webViews.entries.get(webViews.previewed);
    const theme = Theme.read(selected.view.page.pallet);

    return Main({
      key: 'root',
      windowTitle: previewed.view.page.title ||
                   previewed.view.uri,
      scrollGrab: true,
      onKeyDown: address.pass(Binding),
      onWindowBlur: address.pass(Blur),
      onWindowFocus: address.pass(Focus),
      onUnload: address.pass(SaveSession),
      onAppUpdateAvailable: address.pass(ApplicationUpdate),
      onRuntimeUpdateAvailable: address.pass(RuntimeUpdate),
      onOpenWindow: address.pass(OpenWindow),
      tabIndex: 1,
      className: ClassSet({
        'moz-noscrollbars': true,
        showtabstrip: state.previews.isActive ||
                      selected.view.id === 'about:dashboard',
        withoutkillzone: selected.view.id === 'about:dashboard'
      }),
      style: {
        height: '100vh',
        width: '100vw',
        color: theme.shellText,
        backgroundColor: theme.shell,
        scrollSnapType: 'mandatory',
        scrollSnapDestination: '0 0',
        position: 'relative',
        overflowY: previewed.view.input.isFocused ? 'hidden' :
                   state.previews.isActive ? 'hidden' :
                   'scroll'
      }
    }, [
      render('WindowBar', WindowBar.view, shell, previewed.view, theme, address),
      render('Previews', Previews.view, webViews, theme, address),
      render('Suggestions', Suggestions.view, previewed.view.suggestions,
             previewed.view.input.isFocused, theme, address),
      render('WebViews', WebViews.view, webViews, address),
      render('Updater', Updates.view, state.updates, address)
    ])
  };
  exports.view = view;
});

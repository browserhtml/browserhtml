/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const {Record, Any, Union} = require('common/typed');
  const {compose} = require('lang/functional');
  const WebView = require('./web-view');
  const Input = require('./web-input');
  const URI = require('common/url-helper');

  // Actions

  const ShowWebView = Record({
    description: 'focus selected web view'
  });

  const ShowWebViewByID = Record({
    description: 'select & focus web view by ID',
    id: String
  });

  const CreateWebView = Record({
    description: 'Create a new web view'
  });

  const EditWebView = Record({
    description: 'Edit selected web view'
  });

  const ChooseNextWebView = Record({
    description: 'Select next web view & activate view chooser'
  });

  const ChoosePreviousWebView = Record({
    description: 'Select previous web view & activate view chooser'
  });

  const Escape = Record({
    description: 'Escape'
  });

  const CloseWebView = Record({
    description: 'Close current web view & edit following web view'
  });

  const {Submit} = Input.Action;

  const Action = Union({
    ShowWebView,
    ShowWebViewByID,
    CreateWebView,
    EditWebView,
    ChooseNextWebView,
    ChoosePreviousWebView,
    Escape,
    CloseWebView,
    Submit
  });
  exports.Action = Action;

  // Update

  const switchMode = mode => state =>
    state.set('mode', mode);

  const focusInput = state =>
    state.setIn(['input', 'isFocused'], true);

  const blurInput = state =>
    state.setIn(['input', 'isFocused'], false);

  const selectViewByID = (state, action) =>
    state.set('webViews', WebView.selectByID(state.webViews, action.id));

  const showWebView = switchMode('show-web-view');
  const showWebViewByID = compose(showWebView, selectViewByID);

  const createWebView = compose(
    switchMode('create-web-view'),
    focusInput,
    state => state.mode === 'create-web-view' ? state :
             state.setIn(['input', 'value'], null));

  const setInputToURI = state =>
    state.setIn(['input', 'value'],
                state.getIn(['webViews', 'loader',
                             state.webViews.selected, 'uri']));

  const editWebView = compose(
    switchMode('edit-web-view'),
    focusInput,
    state => state.mode === 'edit-web-view' ? state :
             setInputToURI(state));

  const selectByOffset = offest => state =>
    state.set('webViews', WebView.selectByOffset(state.webViews, offset));

  const choosNextWebView = compose(
    switchMode('choose-web-view'),
    blurInput,
    selectByOffset(1));

  const choosePreviousWebView = compose(
    switchMode('choose-web-view'),
    blurInput,
    selectByOffset(-1));

  const closeWebView = compose(
    switchMode('edit-web-view'),
    focusInput,
    state => state.set('webViews', WebView.close(state.webViews)));

  const clearInput = state =>
    state.setIn(['input', 'value'], null);

  const escape = compose(
    showWebView,
    blurInput,
    clearInput);

  const navigate = state => {
    const uri = URI.read(state.input.value);
    return state.set('webViews', state.mode === 'edit-web-view' ?
                                  WebView.load(state.webViews, {uri}) :
                                  WebView.open(state.webViews, uri));
  };

  const submit = compose(
    switchMode('show-web-view'),
    clearInput,
    navigate);

  const update = (state, action) =>
    action instanceof Submit ?
      submit(state) :
    action instanceof ShowWebView ?
      showWebViewByID(state) :
    action instanceof ShowWebViewByID ?
      showWebViewByID(state, action) :
    action instanceof CreateWebView ?
      createWebView(state) :
    action instanceof EditWebView ?
      editWebView(state) :
    action instanceof ChooseNextWebView ?
      choosNextWebView(state) :
    action instanceof ChoosePreviousWebView ?
      choosePreviousWebView(state) :
    action instanceof CloseWebView ?
      closeWebView(state) :
    action instanceof Escape ?
      escape(state) :
    state;

  exports.update = update;
});

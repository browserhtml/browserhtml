/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const {Record, Union, Maybe} = require('common/typed');
  const {html, render} = require('reflex');
  const {isPrivileged, getDomainName} = require('common/url-helper');
  const {mix} = require('common/style');

  const {KeyBindings} = require('common/keyboard');
  const Editable = require('common/editable');
  const WebView = require('./web-view');
  const Navigation = require('./web-navigation');
  const Shell = require('./web-shell');
  const Input = require('./web-input');
  const Progress = require('./progress-bar');

  const Theme = require('./theme');

  // Model

  const Color = String;
  const LocationBarStyle = Record({
    display: 'inline-block',
    position: 'relative',
    MozWindowDragging: 'no-drag',
    borderRadius: 3,
    lineHeight: '30px',
    width: 460, // FIXME :Doesn't shrink when window is narrow
    height: 30,
    padding: '0 30px',
    margin: '0 67px',
    backgroundColor: 'rgba(0,0,0,0.07)',
    overflow: 'hidden'
  }, 'LocationBarStyle');

  const ButtonStyle = Record({
    opacity: Maybe(Number),
    pointerEvents: Maybe(String),
    display: Maybe(String),
    left: Maybe(Number),
    right: Maybe(Number),
    color: Maybe(Color),
    backgroundColor: Maybe(Color),

    position: 'absolute',
    top: 0,
    width: 30,
    height: 30,
    fontFamily: 'FontAwesome',
    textAlign: 'center',
    fontSize: '17px',
    verticalAlign: 'middle',
    cursor: 'default'
  }, 'NavigationButtonStyle');

  const URLInputStyle = Record({
    padding: Maybe(Number),
    maxWidth: Maybe(Number),
    color: Maybe(Color),
    backgroundColor: Maybe(Color),

    lineHeight: '30px',
    overflow: 'hidden',
    width: '100%',
    borderRadius: 0
  }, 'URLInputStyle');

  const PageSummaryStyle = Record({
    maxWidth: Maybe(Number),
    padding: Maybe(Number),
    color: Maybe(Color),
    backgroundColor: Maybe(Color),

    lineHeight: '30px',
    overflow: 'hidden',
    width: '100%',
    display: 'inline-block',
    textOverflow: 'ellipsis',
    textAlign: 'center'
  }, 'PageSummaryStyle');

  const LocationTextStyle = Record({
    color: Maybe(Color),
    backgroundColor: Maybe(Color),
    fontWeight: 'bold'
  }, 'LocationTextStyle');

  const TitleTextStyle = Record({
    color: Maybe(Color),
    backgroundColor: Maybe(Color),
    padding: 5
  }, 'TitleTextStyle');

  const Model = Record({
    theme: Theme,
    view: WebView.Model,
  });
  exports.Model = Model;

  const backButton = ButtonStyle({left: 0});
  const reloadButton = ButtonStyle({right: 0});
  const stopButton = ButtonStyle({right: 0});

  // Actions

  const {Focus, Blur} = Input.Action;
  const {Select, Change} = Editable.Action;
  const {Load} = WebView.Action;
  const {Enter} = Input.Action;
  const {GoBack, GoForward, Stop, Reload} = Navigation.Action;

  const Preview = Record({
    isActive: true
  }, 'LocationBar.Action.PreviewAction');

  const SelectSuggestion = Record({
    offset: Number
  }, 'LocationBar.Action.SuggestPrevious');

  const Submit = Record({
    id: '@selected'
  }, 'LocationBar.Action.Submit');

  const Action = Union({Preview, SelectSuggestion, Submit});
  exports.Action = Action;


  // Update

  const collapse = {maxWidth: 0, padding: 0};
  const disable = {opacity: 0.2, pointerEvents: 'none'};
  const hide = {display: 'none'};


  // View

  const SuggestNext = () => SelectSuggestion({offest: 1});
  const SuggestPrevious = () => SelectSuggestion({offest: -1});

  const Binding = KeyBindings({
    'up': SuggestPrevious,
    'constrol p': SuggestPrevious,
    'down': SuggestNext,
    'control n': SuggestNext,
    'enter': Submit,
    'escape': Shell.Action.Focus,
    'accel l': Input.Enter
  });


  const BackIcon = '\uf053';
  const GearIcon = '\uf013';
  const LockIcon = '\uf023';
  const ReloadIcon = '\uf01e';
  const StopIcon = '\uf00d';

  const isLoading = Progress.isLoading;

  const view = (webView, theme, address) => {
    const {id, uri, input, page, security, progress, navigation} = webView;
    return html.div({
      key: 'LocationBar',
      style: LocationBarStyle(theme.locationBar),
      onMouseEnter: address.pass(Preview)
    }, [
      html.div({
        key: 'back',
        onClick: GoBack,
        style: navigation.canGoBack ? backButton.merge(theme.backButton) :
               backButton.merge(theme.backButton).merge(disable)
      }, BackIcon),
      Editable.view({
        key: 'input',
        placeholder: 'Search or enter address',
        type: 'text',
        value: input.value,
        style: input.isFocused ? URLInputStyle(theme.urlInput) :
               URLInputStyle(theme.urlInput).merge(collapse),
        isFocused: input.isFocused,
        selectionStart: input.selectionStart,
        selectionEnd: input.selectionEnd,
        selectionDirection: input.selectionDirection,

        onSelect: address.pass(Select.for),
        onChange: address.pass(Change.for),

        onFocus: address.send(Input.Action.Focus({id})),
        onBlur: address.send(Input.Action.Blur({id})),
        onKeyDown: address.pass(Binding)
      }),
      html.p({
        key: 'page-info',
        style: !input.isFocused ? PageSummaryStyle(theme.pageSummary) :
               PageSummaryStyle(theme.pageSummary).merge(collapse),
        onClick: address.send(Input.Action.Enter({id}))
      }, [
        html.span({
          key: 'securityicon',
          style: {
            fontFamily: 'FontAwesome',
            fontWeight: 'normal',
            marginRight: 6,
            verticalAlign: 'middle'
          }
        }, isPrivileged(uri) ? GearIcon :
           security.secure ? LockIcon :
           ''),
        html.span({
          key: 'location',
          style: LocationTextStyle(theme.locationText),
        }, uri ? getDomainName(uri) : ''),
        html.span({
          key: 'title',
          style: TitleTextStyle(theme.titleText),
        }, page.title ? page.title :
           isLoading(progress) ? 'Loading...' :
           'New Tab'),
      ]),
      html.div({
        key: 'reload-button',
        style: isLoading(progress) ? reloadButton.merge(theme.reloadButton) :
               !uri ? reloadButton.merge(theme.reloadButton)
                                  .merge(disable) :
               reloadButton,
        onClick: address.send(Reload({id})),
      }, ReloadIcon),
      html.div({
        key: 'stop-button',
        style: isLoading(progress) ? stopButton.merge(theme.stopButton) :
               stopButton.merge(theme.stopButton)
                         .merge(hide),
        onClick: address.send(Stop({id}))
      }, StopIcon)
    ]);
  };

  exports.view = view;
});

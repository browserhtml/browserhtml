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
  const Preview = require('./preview-box');

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


  const SelectSuggestion = Record({
    offset: Number
  }, 'LocationBar.Action.SuggestPrevious');

  const Submit = Record({
    id: '@selected'
  }, 'LocationBar.Action.Submit');

  const Action = Union({SelectSuggestion, Submit});
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
  }, 'LocationBar.Keyboard.Action');


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
      style: LocationBarStyle({backgroundColor: theme.locationBar}),
      onMouseEnter: address.pass(Preview.Action.Activate)
    }, [
      html.div({
        key: 'back',
        onClick: address.pass(GoBack, webView),
        style: navigation.canGoBack ? backButton.merge({color: theme.backButton}) :
               backButton.merge({color: theme.backButton}).merge(disable)
      }, BackIcon),
      Editable.view({
        key: 'input',
        placeholder: 'Search or enter address',
        type: 'text',
        value: input.value,
        style: input.isFocused ? URLInputStyle({color: theme.inputText}) :
               URLInputStyle({color: theme.inputText}).merge(collapse),
        isFocused: input.isFocused,
        selectionStart: input.selectionStart,
        selectionEnd: input.selectionEnd,
        selectionDirection: input.selectionDirection,

        onSelect: address.pass(Select.for),
        onChange: address.pass(Change.for),

        onFocus: address.pass(Input.Action.Focus, webView),
        onBlur: address.pass(Input.Action.Blur, webView),
        onKeyDown: address.pass(Binding)
      }),
      html.p({
        key: 'page-info',
        style: !input.isFocused ? PageSummaryStyle({color: theme.locationText}) :
               PageSummaryStyle({color: theme.locationText}).merge(collapse),
        onClick: address.pass(Input.Action.Enter, webView)
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
          style: LocationTextStyle({color: theme.locationText}),
        }, uri ? getDomainName(uri) : ''),
        html.span({
          key: 'title',
          style: TitleTextStyle({color: theme.titleText}),
        }, page.title ? page.title :
           isLoading(progress) ? 'Loading...' :
           'New Tab'),
      ]),
      html.div({
        key: 'reload-button',
        style: reloadButton.merge({color: theme.controlButton})
                           .merge(isLoading(progress) ? hide :
                                  !uri ? disable :
                                  null),
        onClick: address.pass(Reload, webView),
      }, ReloadIcon),
      html.div({
        key: 'stop-button',
        style: isLoading(progress) ? stopButton.merge({color: theme.controlButton}) :
               stopButton.merge({color: theme.controlButton})
                         .merge(hide),
        onClick: address.pass(Stop, webView)
      }, StopIcon)
    ]);
  };

  exports.view = view;
});

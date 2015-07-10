/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const {Record, Union, Maybe} = require('common/typed');
  const {html, render} = require('reflex');
  const URI = require('common/url-helper');
  const {StyleSheet, Style} = require('common/style');

  const {KeyBindings} = require('common/keyboard');
  const Editable = require('common/editable');
  const WebView = require('./web-view');
  const Navigation = require('./web-navigation');
  const Shell = require('./web-shell');
  const Input = require('./web-input');
  const Suggestions = require('./suggestion-box');
  const ClassSet = require('common/class-set');

  const Theme = require('./theme');

  // Model

  // Style

  const style = StyleSheet.create({
    container: {
      position: 'absolute',
      zIndex: 101,
      top: 0,
      padding: '3px',
      width: '100vw',
      textAlign: 'center',
      pointerEvents: 'none'
    },
    bar: {
      display: 'inline-block',
      MozWindowDragging: 'no-drag',
      borderRadius: 5,
      lineHeight: '22px',
      height: 22,
      padding: '0 3px',
      margin: '0',
      overflow: 'hidden',
      pointerEvents: 'all',
      width: null
    },
    inactive: {
      width: 250, // FIXME :Doesn't shrink when window is narrow
    },
    active: {
      width: 400
    },
    button: {
      opacity: null,
      pointerEvents: null,
      display: null,
      left: null,
      right: null,

      color: 'inherit',
      position: 'absolute',
      top: 0,
      width: 30,
      height: 30,
      fontFamily: 'FontAwesome',
      textAlign: 'center',
      fontSize: '17px',
      verticalAlign: 'middle',
      cursor: 'default'
    },

    back: {left: 0},
    reload: {right: 0},
    stop: {right: 0},
    dashboard: {right: 0},

    input: {
      padding: null,
      maxWidth: null,

      color: '#333',
      width: '100%',
      lineHeight: '22px',
      overflow: 'hidden',
      borderRadius: 0
    },

    summary: {
      maxWidth: null,
      padding: null,
      color: null,
      backgroundColor: null,

      lineHeight: '22px',
      overflow: 'hidden',
      width: '100%',
      display: 'inline-block',
      textOverflow: 'ellipsis',
      textAlign: 'center'
    },

    locationText: {
      backgroundColor: null,
      color: 'inherit',
      fontWeight: 'bold'
    },

    titleText: {
      color: 'interit',
      backgroundColor: null,
      padding: 5
    },

    visible: {
      visibility: 'visible'
    },
    invisible: {
      visibility: 'hidden'
    },
    icon: {
      fontSize: '16px',
      fontFamily: 'FontAwesome'
    },

    collapsed: {maxWidth: 0, padding: 0},
    disabled: {opacity: 0.2, pointerEvents: 'none'},
    hidden: {display: 'none'},

    security: {
      fontFamily: 'FontAwesome',
      fontWeight: 'normal',
      marginRight: 6,
      verticalAlign: 'middle'
    }
  });


  // Events

  const {Focus, Blur, Submit} = Input.Action;
  const {Load} = WebView.Action;
  const {Enter} = Input.Action;
  const {GoBack, GoForward, Stop, Reload} = Navigation.Action;

  // Action

  const Edit = Record({
    id: '@selected'
  }, 'LocationBar.Action.Edit');

  const Action = Union({Edit});

  exports.Action = Action;


  // view


  const {SelectNext, SelectPrevious} = Suggestions.Action;

  const Binding = KeyBindings({
    'up': _ => SelectPrevious({id: '@selected'}),
    'control p': _ => SelectPrevious({id: '@selected'}),
    'down': _ => SelectNext({id: '@selected'}),
    'control n': _ => SelectNext({id: '@selected'}),
    'enter': _ => Submit({id: '@selected'}),
    'escape': _ => Shell.Action.Focus({id: '@selected'}),
  }, 'LocationBar.Keyboard.Action');


  const BackIcon = '\uf053';
  const GearIcon = '\uf013';
  const LockIcon = '\uf023';
  const ReloadIcon = '\uf01e';
  const StopIcon = '\uf00d';
  const SEARCH_ICON = '\uf002';

  const Change = ({target}) =>
    Input.Action.Change({
      id: '@selected',
      value: target.value,
      selection: Editable.Selection({
        start: target.selectionStart,
        end: target.selectionEnd,
        direction: target.selectionDirection
      })
    });

  const viewBar = isActive => children => html.div({
    style: style.container,
  }, [
    html.div({
      key: 'LocationBar',
      className: ClassSet({
        'location-bar': true,
        active: isActive
      }),
      style: Style(style.bar,
                   isActive ? style.active : style.inactive),
      onClick: address.pass(Input.Action.Enter)
    }, children)
  ]);

  const viewActiveBar = viewBar(true);
  const viewInactiveBar = viewBar(false);

  const viewInDashboard = (loader, security, page, input, suggestions, theme, address) =>
    viewActiveBar([
      html.span({
        key: 'icon',
        style: Style(style.icon, style.visible)
      }, SEARCH_ICON),
      Editable.view({
        key: 'input',
        className: 'location-bar-input',
        placeholder: 'Search or enter address',
        type: 'text',
        value:
          suggestions.selected >= 0 ?
            suggestions.entries.get(suggestions.selected).uri :
            (input.value || ''),
        style: style.input,
        isFocused: input.isFocused,
        selection: input.selection,
        onChange: address.pass(Change),
        onFocus: address.pass(Input.Action.Focused),
        onBlur: address.pass(Input.Action.Blured),
        onKeyDown: address.pass(Binding)
      })
    ]);

  const viewInWebView = (loader, security, page, input, suggestions, theme, address) =>
    viewInactiveBar([
      html.p({
        key: 'page-info',
        style: Style(style.summary, {color: theme.locationText})
      }, [
        html.span({
          key: 'securityicon',
          style: style.security
        },
           !loader ? '' :
           URI.isPrivileged(loader.uri) ? GearIcon :
           security.secure ? LockIcon :
           ''),
        html.span({
          key: 'title',
          style: Style(style.titleText, {
            color: theme.titleText
          })
        }, !loader ? '' :
           page.title ? page.title :
           loader.uri ? URI.getDomainName(loader.uri) :
           'New Tab'),
      ])
    ]);

  const view = (mode, ...rest) =>
    mode === 'show-web-view' ? viewInWebView(...rest) :
    viewInDashboard(...rest);

  // TODO: Consider seperating location input field from the location bar.

  exports.view = view;
});

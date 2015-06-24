/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const {Record, Union, List, Maybe, Any} = require('common/typed');
  const {html, render} = require('reflex');
  const ClassSet = require('common/class-set');
  const Preview = require('./preview-box');
  const WebViews = require('./web-view-deck');
  const WebView = require('./web-view');

  // Model

  const Model = Record({
    isActive: false
  }, 'Previews');
  exports.Model = Model;


  // Action

  const Activate = Record({
    isActive: true
  }, 'Preview.Activate');

  const Deactivate = Record({
    isActive: false
  }, 'Preview.Deactivate');

  const Action = Union({Activate, Deactivate});
  exports.Action = Action;

  // Update

  const update = (state, action) =>
    action instanceof Activate ? state.set('isActive', true) :
    action instanceof Deactivate ? state.set('isActive', false) :
    action instanceof SelectByID ? state.set('isActive', false) :
    state;
  exports.update = update;

  const {PreviewByID, SelectByID} = WebViews.Action;
  const Close = (context, event) => {
    if (event.button === 1) {
      event.stopPropagation();
      return WebView.Close(context);
    }
    // We should probably just allow retuning null
    return {}
  }

  // View

  const DashboardIcon = '\uf067';

  const viewControls = (theme, address) => html.div({
    style: {
      position: 'absolute',
      right: '6px',
      top: '6px'
    }
  }, [
    html.button({
      key: 'dashboard-button',
      style: {
        color: 'inherit',
        lineHeight: '16px',
        fontFamily: 'FontAwesome',
        textAlign: 'center',
        fontSize: 16,
        verticalAlign: 'middle',
        cursor: 'default'
      },
      onClick: address.pass(Activate)
    }, DashboardIcon)
  ]);
  exports.viewControls = viewControls;

  const viewPreview = (id, index, selected, page, address) => {
    const context = {id};

    return html.div({
      key: id,
      className: 'card',
      style: {
        margin: '6px',
        borderRadius: '4px',
        height: '300px',
        width: '240px',
        backgroundColor: '#fff',
        display: 'inline-block',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4)'
      },
      onMouseOver: address.pass(PreviewByID, context),
      onClick: address.pass(SelectByID, context),
      onMouseUp: address.pass(Close, context)
    }, [
      html.header({
        key: 'header',
        style: {
          textAlign: 'left',
          height: '24px',
          padding: '0 10px',
          position: 'relative'
        }
      }, [
        html.span({
          key: 'name',
          style: {
            display: 'block',
            fontSize: '12px',
            lineHeight: '24px',
            width: '200px',
            overflow: 'hidden',
            textOverflow: 'clip ellipsis'
          }
        }, page.title),
        html.span({
          key: 'icon',
          alt: '',
          style: {
            position: 'absolute',
            right: '5px',
            top: '5px',
            width: '16px',
            height: '16px',
            MozForceBrokenImageIcon: 0,
            backgroundImage: `url(${page.icon})`
          }
        })
      ]),
      html.div({
        style: {
          backgroundImage: `url(${page.thumbnail})`,
          backgroundSize: 'cover',
          width: '240px',
          height: '150px',
        }
      }, [
        html.img({
          key: 'image',
          src: page.thumbnail,
          alt: '',
          style: {
            position: 'absolute',
            zIndex: -1,
            width: 'inherit',
            height: 'inherit'
          },
          onLoad: event => URL.revokeObjectURL(event.target.src)
        })
      ]),
      html.p({
        key: 'description'
      }, page.description)
    ]);
  };
  exports.viewPreview = viewPreview;

  const view = (state, webViews, theme, address) => html.div({
    style: {
      position: 'absolute',
      width: '100vw',
      height: 'calc(100vh - 28px)',
      textAlign: 'center',
      paddingTop: 'calc(100vh / 2 - 150px - 28px)',
      backgroundColor: '#273340',
      overflowX: 'auto',
      display: !state.isActive && 'none'
    }
  }, webViews.entries.map(({view}, index) =>
      render(view.id,
             viewPreview,
             view.id,
             index,
             webViews.selected,
             view.page,
             address)));
  exports.view = view;

});

/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {html, thunk, forward} from 'reflex';
import {asByID} from './web-views';
import * as WebView from './web-view';
import {Style, StyleSheet} from '../common/style';
import {readTitle, readFaviconURI} from './web-view';
import * as Toolbar from "./sidebar/toolbar";
import {cursor, merge} from "../common/prelude";
import * as Unknown from "../common/unknown";


const styles = StyleSheet.create({
  sidebar: {
    // WARNING: will slow down animations! (gecko)
    xBoxShadow: 'rgba(0, 0, 0, 0.5) -80px 0 100px',
    backgroundColor: '#2E3D4D',
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
    width: '380px',
    boxSizing: 'border-box'
  },

  scrollbox: {
    width: '100%',
    height: `calc(100% - ${Toolbar.styleSheet.toolbar.height})`,
    paddingTop: '35px',
    overflowY: 'scroll',
    boxSizing: 'border-box'
  },

  tab: {
    MozWindowDragging: 'no-drag',
    borderRadius: '5px',
    lineHeight: '35px',
    color: '#fff',
    fontSize: '14px',
    overflow: 'hidden',
    padding: '0 10px 0 33px',
    position: 'relative',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  tabSelected: {
    backgroundColor: '#3D5166'
  },

  title: {
    display: 'inline'
  },

  favicon: {
    borderRadius: '3px',
    left: '9px',
    position: 'absolute',
    top: '10px',
    width: '16px',
    height: '16px',
  }
});


export const init = () => {
  const [toolbar, fx] = Toolbar.init()
  return [{isAttached: false, toolbar}, fx.map(Controls)]
}

const attach = {isAttached: true};
const detach = {isAttached: false};

const controls = cursor({
  get: model => model.toolbar,
  set: (model, toolbar) => merge(model, {toolbar}),
  tag: Controls,
  update: Toolbar.step
});

export const step = (model, action) =>
    action.type === "Attach"
  ? controls(merge(model, attach), action)
  : action.type === "Detach"
  ? controls(merge(model, detach), action)
  : action.type === "Controls"
  ? controls(model, action.action)
  : Unknown.step(model, action)



const Controls = action =>
    action.type === "Attach"
  ? action
  : action.type === "Detach"
  ? action
  : ({type: "Controls", action});

const Tabs = action =>
  ({type: "Tabs", action});

const viewImage = (uri, style) =>
  html.img({
    style: Style({
      backgroundImage: `url(${uri})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      border: 'none'
    }, style)
  });

const viewTab = (model, address) =>
  html.div({
    className: 'sidebar-tab',
    style: Style(
      styles.tab,
      model.isSelected && styles.tabSelected
    ),
    onMouseDown: () => address(WebView.Select),
    onMouseUp: () => address(WebView.Activate)
  }, [
    thunk('favicon',
          viewImage,
          readFaviconURI(model),
          styles.favicon),
    html.div({
      className: 'sidebar-tab-title',
      style: styles.title
    }, [
      // @TODO localize this string
      readTitle(model, 'Untitled')
    ])
  ]);


const viewSidebar = (key, styleSheet) => (model, {entries}, address, style) => {
  const tabs = forward(address, Tabs);
  return html.div({
    key: key,
    className: key,
    style: Style
      ( styleSheet.base

      ,   model.isAttached
        ? styleSheet.attached
        : styleSheet.detached

      ,   model.isAttached
        ? null
        : style
      )
  }, [
    html.div({
      className: 'sidebar-tabs-scrollbox',
      style: styles.scrollbox
    }, entries.map(entry =>
        thunk(entry.id, viewTab, entry, forward(tabs, asByID(entry.id))))),
    thunk('sidebar-toolbar', Toolbar.view, model.toolbar, forward(address, Controls))
  ]);
}

export const view = viewSidebar('sidebar', StyleSheet.create({
  base: styles.sidebar,
  attached: {
    right: `calc(-380px + ${Toolbar.styleSheet.toolbar.height})`,
    padding: '0 18px'
  },
  detached: {
    width: '380px',
    padding: '0 35px'
  }
}));

/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {html, thunk, forward, Effects} from 'reflex';
import {asByID} from './web-views';
import * as WebView from './web-view';
import {Style, StyleSheet} from '../common/style';
import {readTitle, readFaviconURI} from './web-view';
import * as Toolbar from "./sidebar/toolbar";
import {merge, always} from "../common/prelude";
import {cursor} from "../common/cursor";
import * as Unknown from "../common/unknown";
import * as Stopwatch from "../common/stopwatch";
import * as Easing from "eased";



const styleSheet = StyleSheet.create({
  sidebar: {
    // WARNING: will slow down animations! (gecko)
    xBoxShadow: 'rgba(0, 0, 0, 0.5) -80px 0 100px',
    backgroundColor: '#2E3D4D',
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
    width: '380px',
    boxSizing: 'border-box',
    zIndex: 2 // @TODO This is a hack to avoid resizing new tab / edit tab views.
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
  return [
    {
      isAttached: false,
      isOpen: false,
      animation: null,
      display: {angle: -15, x: 500},
      toolbar
    },
    fx.map(ToolbarAction)
  ]
}

export const Model =
  ({isAttached, isOpen, toolbar}) =>
  ({isAttached, isOpen, toolbar});

export const Attach = {type: "Attach"};
export const Detach = {type: "Detach"};
export const Open = {type: "Open"};
export const Close = {type: "Close"};
const AnimationAction = action => ({type: "Animation", action});
const AnimationEnd = always({type: "AnimationEnd"});

const ToolbarAction = action =>
    action.type === "Attach"
  ? Attach
  : action.type === "Detach"
  ? Detach
  : ({type: "Toolbar", action});

const TabsAction = action =>
  ({type: "Tabs", action});


const updateToolbar = cursor({
  get: model => model.toolbar,
  set: (model, toolbar) => merge(model, {toolbar}),
  tag: ToolbarAction,
  update: Toolbar.update
});



const updateStopwatch = cursor({
  tag: AnimationAction,
  get: model => model.animation,
  set: (model, animation) => merge(model, {animation}),
  update: Stopwatch.update
});

const interpolate = (from, to, progress) => merge(from, {
  angle: Easing.float(from.angle, to.angle, progress),
  x: Easing.float(from.x, to.x, progress)
})

const animationProjection = model =>
    model.isOpen
  ? {angle: 0, x: 0}
  : model.isAttached
  ? {angle: 0, x: 330}
  : {angle: -15, x: 500}

const animationDuration = model =>
    model.isOpen
  ? ( model.isAttached
    ? 500
    : 600
    )
  : ( model.isAttached
    ? 350
    : 400
    );



const updateAnimation = (model, action) => {
  const [{animation}, fx] = updateStopwatch(model, action.action)
  const duration = animationDuration(model)

  // @TODO: We should not be guessing what is the starnig point
  // that makes no sense & is likely to be incorrect at a times.
  // To fix it we need to ditch this easing library in favor of
  // something that will give us more like spring physics.
  const begin
    = !model.isOpen
    ? {angle: 0, x: 0}
    : model.isAttached
    ? {angle: 0, x: 330}
    : {angle: -15, x: 500};

  const projection = animationProjection(model)


  return duration > animation.elapsed
    ? [ merge(model, {
          animation,
          display: Easing.ease
            ( Easing.easeOutCubic
            , interpolate
            , begin
            , projection
            , duration
            , animation.elapsed
            )
        })
      , fx
      ]
    : [ merge(model, {animation, display: projection})
      , fx.map(AnimationEnd)
      ]
}


export const update = (model, action) =>
    action.type === "Animation"
  ? updateAnimation(model, action)
  : action.type === "AnimationEnd"
  ? updateStopwatch(model, Stopwatch.End)
  : action.type === "Open"
  ? updateStopwatch(merge(model, {isOpen: true}), Stopwatch.Start)
  : action.type === "Close"
  ? updateStopwatch(merge(model, {isOpen: false}), Stopwatch.Start)
  : action.type === "Attach"
  ? updateToolbar(merge(model, {isAttached: true}), Toolbar.Attach)
  : action.type === "Detach"
  ? updateToolbar(merge(model, {isAttached: false}), Toolbar.Detach)
  : action.type === "Toolbar"
  ? updateToolbar(model, action.action)
  : Unknown.update(model, action)



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
      styleSheet.tab,
      model.isSelected && styleSheet.tabSelected
    ),
    onMouseDown: () => address(WebView.Select),
    onMouseUp: () => address(WebView.Activate)
  }, [
    thunk('favicon',
          viewImage,
          readFaviconURI(model),
          styleSheet.favicon),
    html.div({
      className: 'sidebar-tab-title',
      style: styleSheet.title
    }, [
      // @TODO localize this string
      readTitle(model, 'Untitled')
    ])
  ]);


const viewSidebar = (key, styleSheet) => (model, {entries}, address) => {
  const tabs = forward(address, TabsAction);
  const {display} = model;
  return html.div({
    key: key,
    className: key,
    style: Style
      ( styleSheet.base


      ,   model.isAttached
        ? styleSheet.attached
        : styleSheet.detached

      , {
          transform:`translateX(${display.x}px) rotateY(${display.angle}deg)`
        }
      )
  }, [
    html.div({
      className: 'sidebar-tabs-scrollbox',
      style: styleSheet.scrollbox
    }, entries.map(entry =>
        thunk(entry.id, viewTab, entry, forward(tabs, asByID(entry.id))))),
    thunk('sidebar-toolbar',
          Toolbar.view,
          model.toolbar,
          forward(address, ToolbarAction))
  ]);
}

export const view = viewSidebar('sidebar', StyleSheet.create({
  base: styleSheet.sidebar,
  attached: {
    padding: '0 18px'
  },
  detached: {
    width: '380px',
    padding: '0 35px'
  }
}));

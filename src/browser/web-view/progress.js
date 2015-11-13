/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*:: import * as type from "../../type/browser/web-view/progress" */

import {Effects} from 'reflex';
import {html} from 'driver';
import {StyleSheet, Style} from '../../common/style';
import {merge} from '../../lang/object';

const second = 1000;

export const asStart/*:type.asStart*/ = (time) => ({
  type: "WebView.Progress.Start",
  timeStamp: time,
});

// @TODO Is change supposed to be connected to http progress events from
// the browser? In this case would it modify the loadEnd estimate in the model?
export const asChange/*:type.asChange*/ = (time) => ({
  type: "WebView.Progress.Change",
  timeStamp: time,
});

export const asEnd/*:type.asEnd*/ = (time) => ({
  type: "WebView.Progress.End",
  timeStamp: time,
});

export const asTick/*:type.asTick*/ = (time) => ({
  type: "WebView.Progress.Tick",
  timeStamp: time,
});

// Start a new progress cycle.
export const start/*:type.start*/ = (timeStamp) => [
  {
    loadStart: timeStamp,
    // Predict a 10s load if we don't know.
    loadEnd: timeStamp + (10 * second),
    updateTime: timeStamp
  },
  Effects.tick(asTick)
];

// Invoked on End action and returns model with updated `timeStamp`:
//  [
//    {...model, loadEnd: timeStamp},
//    Effects.none
//  ]
export const end = (timeStamp, model) => [
  merge(model, {loadEnd: timeStamp}),
  Effects.none
];

// Update the progress and request another tick.
// Returns a new model and a tick effect.
export const tick/*:type.tick*/ = (timeStamp, model) => [
  merge(model, {updateTime: timeStamp}),
  Effects.tick(asTick)
];

export const step = (model, action) =>
  action.type === 'WebView.Progress.Start' ?
    start(action.timeStamp) :
  action.type === 'WebView.Progress.End' ?
    end(action.timeStamp, model) :
  action.type === 'WebView.Progress.Tick' ?
    tick(action.timeStamp, model) :
  model;

// @TODO currently we're doing naive linear animation. Add easing.
export const progress/*:type.progress*/ = (model) =>
  (model.updateTime / model.loadEnd) * 100;

const style = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    height: '4px',
    width: '100%'
  },
  // This is the angle that we have at the end of the progress bar
  arrow: {
    width: '4px',
    height: '4px',
    position: 'absolute',
    right: '-4px',
  },
});

// @TODO bring back color theme
export const view/*:type.view*/ = (model) =>
  html.div({
    key: 'progressbar',
    style: Style(style.bar, {
      backgroundColor: '#4A90E2',
      // @TODO this progress treatment is extremely naive and ugly. Fix it.
      transform: `translateX(${-100 + progress(model)}%);`,
      visibility: progress(model) < 100 ? 'visible' : 'hidden'
    }),
  }, [html.div({
    key: 'progressbar-arrow',
    style: Style(style.arrow, {
      backgroundImage: 'linear-gradient(135deg, #4A90E2 50%, transparent 50%)',
    })
  })]);
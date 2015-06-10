/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const {html} = require('reflex');
  const {animate} = require('common/animation');
  const {Record, Union} = require('common/typed');
  const Theme = require('./theme');


  // Model

  const Model = Record({
    loadStarted: -1,
    connected: -1,
    loadEnded: -1,

    value: 0
  });
  exports.Model = Model;

  // Returns `true` if associated web-view is loading a page.
  const isLoading = ({loadStarted, value}) =>
    loadStarted > 0 && value < 1;
  exports.isLoading = isLoading;

  // Returns `true` if associated web-view connected to server.
  const isConnecting = ({loadStarted, connected}) =>
    loadStarted > 0 && connected <= 0;
  exports.isConnecting = isConnecting;


  // Actions

  const LoadProgress = Record({
    id: String,
    tiemStamp: Number
  }, 'WebView.Progress.LoadProgress');

  const LoadStart = Record({
    id: String,
    timeStamp: Number
  }, 'WebView.Progress.LoadStart');

  const LoadEnd = Record({
    id: String,
    timeStamp: Number
  }, 'WebView.Progress.LoadEnd');


  const ProgressChange = Record({
    id: String,
    value: Number
  }, 'WebView.Progress.ProgressChange');


  exports.LoadProgress = LoadProgress;
  exports.LoadStart = LoadStart;
  exports.LoadEnd = LoadEnd;
  exports.ProgressChange = ProgressChange;
  exports.Action = Union({ProgressChange, LoadProgress,
                          LoadStart, LoadEnd});


  // Update

  const update = (state, action) =>
    !action ? state :
    action.id != state.id ? state :
    action instanceof ProgressChange ? state.set('value', action.value) :
    action instanceof LoadStart ? state.set('loadStarted', action.timeStamp) :
    action instanceof LoadEnd ? state.set('loadEnded', action.timeStamp) :
    // Only update `connected` if web-view is connecting.
    action instanceof LoadProgress ?
      (isConnecting(state) ? state.set('connected', action.timeStamp) : state) :
    state;
  exports.update = update;


  // Animation parameters:
  const A = 0.2;              // Zone A size (a full progress is equal to '1'
  const B = 0.2;              // Zone B size
  const APivot = 200;         // When to reach ~80% of zone A
  const BPivot = 500;         // When to reach ~80% of zone B
  const CDuration = 200;     // Time it takes to fill zone C

  const approach = (tMs, pivoMs) => 2 * Math.atan(tMs / pivoMs) / Math.PI;


   // Progress bar logic:
   // The progressbar is split in 3 zones. Called A, B and C.
   //   Zone A is slowly filled while the browser is connecting to the server.
   //   Zone B is slowly filled while the page is being downloaded.
   //   Zone C is filled once the page has loaded (fast).
   //   Zone A and B get filled slower and slower in a way that they are never
   //   100% filled.
  const computeProgress = ({now, loadStarted, connected, loadEnded}) => {
    // Inverse tangent function: [0 - inf] -> [0 - PI/2]
    // approach: [time, pivot] -> [0 - 1]
    // Pivot value is more or less when the animation seriously starts to slow down

    const a = loadStarted < 0 ? 0 :
              A * approach(now - loadStarted, APivot);
    const b = connected < 0 ? 0 :
              B * approach(now - connected, BPivot);
    const c = loadEnded < 0 ? 0 :
              (1 - a - b) * (now - loadEnded) / CDuration;

    return Math.min(1, a + b + c);
  };

  const ComputeProgressChange = (id, state, {timeStamp}) =>
    ProgressChange({id,
      value: computeProgress({
        now: timeStamp,
        loadStarted: state.loadStarted,
        connected: state.connected,
        loadEnded: state.loadEnded
      })
    });


  // View

  const startFading = 0.8;    // When does opacity starts decreasing to 0
  const computeOpacity = progress =>
    progress < startFading ? 1 :
    1 - Math.pow((progress - startFading) / (1 - startFading), 1);

  const view = (progress, id, theme, address) => {
    const node = html.div({
      key: 'ProgressBar',
      zIndex: 99,
      display: 'block',
      width: '100%',
      height: 3,
      marginLeft: '-100%',
      position: 'absolute',
      top: 50,
      left: 0,
      backgroundColor: theme.progressbar.color,
      opacity: computeOpacity(progress.value),
      transform: `translateX(${100 * progress.value}%)`
    });

    // If `webView` is loading then animate node with `ProgressChange` actions
    // on every animatation frame.
    return !isLoading(progress) ? node :
           animate(node, address.pass(ComputeProgressChange, id, state));
  };
  exports.view = view;
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

import {Record, Union, List, Maybe, Any} from 'typed-immutable';
import {GoBack, GoForward} from './web-navigation';

// Action

export const BeginSwipe = Record({
  description: 'Begin swiping a sheet',
  delta: Number,
  timeStamp: Number
}, 'Sheet.BeginSwipe');

export const EndSwipe = Record({
  description: 'End swiping a sheet',
  timeStamp: Number
}, 'Sheet.EndSwipe')

export const ContinueSwipe = Record({
  description: 'Continue swiping a sheet',
  timeStamp: Number,
  delta: Number
}, 'Sheet.ContinueSwipe');

export const AnimationFrame = Record({
  description: 'Animating a sheet',
  timeStamp: Number
}, 'Sheet.AnimationFrame');

export const Action = Union(BeginSwipe, EndSwipe, ContinueSwipe,
                            AnimationFrame);


// Model

export const Model = Record({
  isForced: Boolean,
  isInMotion: Boolean,
  // Action that needs to trigger when motion is complete.
  // This is an ugly workaround that we need to use until
  // we allow update to request an action.
  action: Maybe(Union(GoBack, GoForward)),

  // Tilt progress in range of -1 to 1 where negative
  // value is for left tilt and positive for right tilt.
  value: Number,

  // All these are derived from above value but unlike
  // value are updated on every animation frame for smooth
  // transition.
  x: Number,
  z: Number,
  angle: Number,

  // Duration of release animation in ms.
  releaseDuration: Number,
  // Timestam of when release occured.
  releaseTime: Maybe(Number)
});

export const init = () => Model({
  isForced: false,
  isInMotion: false,
  action: null,

  x: 0,
  z: 0,
  angle: 0,
  value: 0,

  releaseDuration: 0,
  releaseTime: null
});




const maxAngle = 15;
const maxZ = -180;
const maxX = 25;
const maxDelta = 0.8;
const maxReleaseAnimationDuration = 300;
const threshold = 0.8;

const clear = (state, _) => state.merge({
  isInMotion: false,
  isForced: false,
  action: null,

  x: 0,
  z: 0,
  angle: 0,
  value: 0,

  releaseDuration: 0,
  releaseTime: null
});

// Apply physical force and produce new state.
const force = (state, action) =>
  state.isForced ?
    state.set('value', Math.max(Math.min(action.delta / maxDelta, 1), -1)) :
    state;

// Tilt model according to the applied force.
const tilt = (state, action) => {
  return state.isForced ?
            state.merge({
              x: Math.floor(state.value * maxX),
              z: Math.floor(Math.abs(state.value) * maxZ),
              angle: Math.floor(state.value * maxAngle * 10) / 10,
            }) :
          state.releaseTime + state.releaseDuration <=  action.timeStamp ?
            clear(state) :
          state;
};

const touch = (state, action) => state.merge({
  isForced: true,
  isInMotion: true,
  action: null,

  x: 0,
  z: 0,
  angle: 0,
  value: 0,

  releaseTime: null,
  releaseDuration: 0
});

// If released passed the threshold provide an action to be triggered
// otherwise just reset fields and compute release animation duration.
const release = (state, action) =>
  state.merge({
    action: Math.abs(state.value) < threshold ? null :
            state.value < 0 ? GoBack() :
            GoForward(),
    angle: 0, x: 0, z: 0,
    isForced: false,
    releaseTime: action.timeStamp,
    releaseDuration: Math.abs(Math.floor(state.value * maxReleaseAnimationDuration))
  });

const physics = (state, action) =>
  action instanceof GoBack ?
    state.set('action', null) :
  action instanceof GoForward ?
    state.set('action', null) :
  action instanceof BeginSwipe ?
    touch(state, action) :
  !state.isInMotion ?
    state :
  action instanceof EndSwipe ?
    release(state, action) :
  action instanceof ContinueSwipe ?
    force(state, action) :
  action instanceof AnimationFrame ?
    tilt(state, action) :
    state;

export const update = (state, action) =>
  physics(state, action);

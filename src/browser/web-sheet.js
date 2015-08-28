/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

import {Record, Union, List, Maybe, Any} from 'typed-immutable';

// Model

export const Model = Record({
  isForced: Boolean,
  isInMotion: Boolean,

  x: Number,
  width: Number,
  delta: Number,
  velocity: Number,
  lastVelocity: Number,
  image: Maybe(String),

  forceTime: Maybe(Number),
  moveTime: Maybe(Number)
});

export const init = () => Model({
  isForced: false,
  isInMotion: false,

  image: null,
  x: 0,
  width: 0,
  delta: 0,
  velocity: 0,
  lastVelocity: 0,

  forceTime: null,
  moveTime: null
});

// Action

export const BeginSwipe = Record({
  description: 'Begin swiping a sheet',
  delta: Number,
  width: Number,
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

export const Screenshot = Record({
  description: 'Made screenshot',
  image: String,
}, 'Sheet.Screenshot');

export const Action = Union(BeginSwipe, EndSwipe, ContinueSwipe,
                            AnimationFrame, Screenshot);


const stop = (state, _) => state.merge({
  isInMotion: false,
  isForced: false,

  velocity: 0,
  lastVelocity: 0,
  x: 0,
  delta: 0,
  image: null,
  width: 0,

  moveTime: null,
  forceTime: null
});

const force = (state, action) =>
  !state.isForced ? state :
    state.merge({
      delta: action.delta,
      forceTime: action.timeStamp,
      lastVelocity: state.velocity,
      velocity: (action.delta - state.delta) /
                (action.timeStamp / state.forceTime)
    });

const move = (state, action) => {
  const x = state.x + Math.floor((action.timeStamp - state.moveTime) * state.velocity * 70);

  return Math.abs(x) >= state.width ?
            stop(state) :
          x <= 0 && state.x > 0 ? stop(state) :
          x >= 0 && state.x < 0 ? stop(state) :
            state.merge({
              moveTime: action.timeStamp,
              x
            });
};

const touch = (state, action) => state.merge({
  isForced: true,
  isInMotion: true,
  x: 0,
  delta: action.delta,
  velocity: 0,
  width: action.width,

  forceTime: action.timeStamp,
  moveTime: action.timeStamp
});

// If when released it's not passed the trethold area then allow
// spring force to move it back to the starting point. Otherwise
// release the force and let the momentum take over.
const release = (state, action) =>
  Math.abs(state.x) < (state.width / 2) ? state :
  state.merge({isForced: false,
              // Hack: It seems that just before MozSwipeGesture we receive
              // MozSwipeGestureUpdate with a same delta as previous one and
              // we end up with velocity 0. Note we can't just ignore such
              // MozSwipeGestureUpdate events as user in fact may stop swiping
              // without releasing a touch which we would not like to ignore.
               velocity: state.lastVelocity});

const physics = (state, action) =>
  action instanceof BeginSwipe ?
    touch(state, action) :
  !state.isInMotion ?
    state :
  action instanceof EndSwipe ?
    release(state, action) :
  action instanceof ContinueSwipe ?
    force(state, action) :
  action instanceof AnimationFrame ?
    move(state, action) :
    state;

export const update = (state, action) =>
  action instanceof Screenshot ?
    state.set('image', action.image) :
  physics(state, action);

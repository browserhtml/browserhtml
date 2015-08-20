/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

import {Record, Union, List, Maybe, Any} from 'typed-immutable';

// Model

const Animation = Record({
  acceleration: Number,
  velocity: Number,
  time: Number,
  elapsedTime: Number
});

export const Model = Record({
  y: 0,
  isVisible: true,
  acceleration: 0,
  velocity: 0,
  elapsedTime: 0,
  timeStamp: Maybe(Number)
});

// Action

export const BeginSwipe = Record({
  description: 'Begin swiping a card',
  timeStamp: Number
}, 'Preview.EndSwipe');

export const EndSwipe = Record({
  description: 'End swiping a card',
  timeStamp: Number
}, 'Preview.EndSwipe')

export const ContinueSwipe = Record({
  description: 'Continue swiping card',
  timeStamp: Number,
  isVisible: Boolean,
  y: Number
}, 'Preview.ContinueSwipe');

export const AnimationFrame = Record({
  description: 'Animating a card',
  timeStamp: Number,
  isVisible: Boolean
})

export const Action = Union(BeginSwipe, EndSwipe, ContinueSwipe, AnimationFrame);

const thresholdY = 0.13;

const physics = (state, action) => {
  const time = action.timeStamp - state.timeStamp;
  const elapsedTime = state.elapsedTime + time;

  console.log(state.toJSON(), action.toJSON());
  return Math.abs(state.y) > thresholdY ?
          state.merge({
            elapsedTime,
            isVisible: action.isVisible,
            timeStamp: action.timeStamp,
            y: state.y + time * state.velocity,
          }) :
        action instanceof AnimationFrame ? state :
        state.merge({
          elapsedTime,
          isVisible: action.isVisible,
          timeStamp: action.timeStamp,
          y: action.y,
          velocity: action.y / elapsedTime,
           //acceleration: state.y / state.elapsedTime - state.velocity / frameTime
         });
};

export const update = (state, action) =>
  action instanceof BeginSwipe ? Model({timeStamp: action.timeStamp}) :
  action instanceof EndSwipe ? state.clear() :
  action instanceof ContinueSwipe ? physics(state, action) :
  action instanceof AnimationFrame ? physics(state, action) :
  state;

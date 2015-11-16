/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @TODO type this file.

// Do a shallow patch on an object, returning a new object.
export const merge = (base, patch) => Object.assign({}, base, patch);

// Use an update function to patch a sub-field of a model, returning
// an updated parent model.
export const updateIn = (key, update, model, action) =>
  merge(model, {[key]: update(model[key], action)});

// Use a step function to patch a sub-field of a model, but
// thread through the effect.
export const stepIn = (key, step, model, action) => {
  const [patch, effect] = step(model[key], action);
  return [merge(model, {[key]: patch}), effect];
}
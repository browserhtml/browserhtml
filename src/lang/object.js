/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

// Do a shallow patch on an object, returning a new object.
export const merge = (base, patch) => Object.assign({}, base, patch);

// Set a property on an object, returning a new object.
export const set = (base, key, value) => merge(base, {[key]: value});

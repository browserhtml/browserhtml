/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*:: import * as type from "../../type/common/settings" */

import * as Settings from '../common/settings';
import * as Runtime from '../common/runtime';
import * as Result from '../common/result';
import * as Unknown from '../common/unknown';
import {merge} from '../common/prelude';
import {Effects, Task} from 'reflex';

export const NotSupported =
  ReferenceError('navigator.mozSettings API is not available');

export const Fetched/*:type.Fetched*/ = result =>
  ({type: "Fetched", result});

export const Updated/*:type.Updated*/ = result =>
  ({type: "Updated", result});

export const Changed/*:type.Changed*/ = result =>
  ({type: "Changed", result});

const makeHash = pairs =>
  pairs.reduce((result, [key, value]) => {
    result[key] = value
    return result
  }, {});


export const fetch/*:type.fetch*/ = (names) => Task.future(() => {
  if (navigator.mozSettings) {
    const lock = navigator.mozSettings.createLock();
    const settings = names
      .map(name =>
            lock.get(name)
                .then(result => [name, result[name]]));

    return Promise.all(settings)
                  .then(makeHash)
                  .then(Result.ok)
                  .catch(Result.error)
                  .then(Fetched);
  } else {
    return Promise.resolve(Fetched(Result.error(NotSupported)));
  }
});


export const change/*:type.change*/ = settings => Task.future(() => {
  if (navigator.mozSettings) {
    const lock = navigator.mozSettings.createLock();
    return lock.set(settings)
               .then(Result.ok)
               .catch(Result.error)
               .then(Changed);
  } else {
    return Promise.resolve(Changed(Result.error(NotSupported)));
  }
});

export const observe/*:type.observe*/ = name => Task.io(deliver => {
  const observer = change => {
    navigator.mozSettings.removeObserver(name, observer);
    deliver(Task.succeed(Updated(Result.ok({[change.settingName]: change.settingValue}))));
  }

  if (navigator.mozSettings) {
    navigator.mozSettings.addObserver(name, observer);
  } else {
    deliver(Task.fail(Updated(Result.error(NotSupported))));
  }
});

const observers = settings =>
  Object.keys(settings)
        .map(observe)


export const init/*:type.init*/ = names =>
  [null, Effects.task(fetch(names))];

const updateSettings = (model, settings) =>
  // @TODO: Ignore unknown settings
  [   model == null
    ? settings
    : merge(model, settings)
  , Effects.batch
    ( Object
        .keys(settings)
        .map(observe)
        .map(Effects.task)
    )
  ];

const reportError = (model, action) => {
  console.error(`Unhandled Settings ${action.type} error`, action.result.error);
  return [model, Effects.none]
}


export const update/*:type.update*/ = (model, action) =>
    action.type === 'Fetched'
  ? ( action.result.isOk
    ? updateSettings(model, action.result.value)
    : reportError(model, action)
    )
  : action.type === 'Updated'
  ? ( action.result.isOk
    ? updateSettings(model, action.result.value)
    : reportError(model, action)
    )
  : action.type === 'Changed'
  ? ( action.result.isOk
    ? updateSettings(model, action.result.value)
    : reportError(model, action)
    )
  : Unknown.update(model, action)

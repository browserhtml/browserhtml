/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*:: import * as type from "../../type/common/settings" */

import * as Settings from '../common/settings';
import * as Result from '../common/result';
import * as Unknown from '../common/unknown';
import {merge, always} from '../common/prelude';
import {Effects, Task} from 'reflex';

export const NotSupported =
  ReferenceError('navigator.mozSettings API is not available');

export const Fetched/*:type.Fetched*/ = result =>
  ( { type: "Fetched"
    , result
    }
  );

export const Updated/*:type.Updated*/ = result =>
  ( { type: "Updated"
    , result
    }
  );

export const Changed/*:type.Changed*/ = result =>
  ( { type: "Changed"
    , result
    }
  );

const merges =
  records =>
  ( records.length === 1
  ? records[0]
  : records.reduce
    ( (result, record) => {
        for (let name in record) {
          if (record.hasOwnProperty(name)) {
            result[name] = record[name]
          }
        }
        return result
      }
    )
  );

export const fetch/*:type.fetch*/ =
  names =>
  Task.future(() => {
    if (navigator.mozSettings) {
      const lock = navigator.mozSettings.createLock();
      const settings = names.map(name => lock.get(name));

      return Promise.all(settings)
                    .then(merges)
                    .then(Result.ok, Result.error);
    } else {
      return Promise.resolve(Result.error(NotSupported));
    }
  });


export const change/*:type.change*/ =
  settings =>
  Task.future(() => {
    if (navigator.mozSettings) {
      return navigator
        .mozSettings
        .createLock()
        .set(settings)
        .then(always(Result.ok(settings)), Result.error);
    } else {
      return Promise.resolve(Result.error(NotSupported));
    }
  });

export const observe/*:type.observe*/ =
  name =>
  Task.io(deliver => {
    const onChange = change => {
      if (navigator.mozSettings) {
        if (name === "*") {
          navigator.mozSettings.removeEventListener("settingchange", onChange);
        }
        else {
          navigator.mozSettings.removeObserver(name, onChange);
        }
      }

      deliver(Task.succeed(Result.ok({[change.settingName]: change.settingValue})));
    }

    if (navigator.mozSettings) {
      if (name === "*") {
        navigator.mozSettings.addEventListener("settingchange", onChange);
      }
      else {
        navigator.mozSettings.addObserver(name, onChange);
      }
    } else {
      deliver(Task.fail(Result.error(NotSupported)));
    }
  });


export const init/*:type.init*/ = names =>
  [ null
  , Effects
    .task(fetch(names))
    .map(Fetched)
  ];

const updateSettings = (model, settings) =>
  // @TODO: Ignore unknown settings
  [ ( model == null
    ? settings
    : merge(model, settings)
    )
  , Effects.batch
    ( Object
      .keys(settings)
      .map(name => Effects.task(observe(name)).map(Updated))
    )
  ];

const report = (model, error) => {
  console.error(`Unhandled error occured `, error);
  return [model, Effects.none]
}


export const update/*:type.update*/ = (model, action) =>
  ( action.type === 'Fetched'
  ? ( action.result.isOk
    ? updateSettings(model, action.result.value)
    : report(model, action.result.error)
    )
  : action.type === 'Updated'
  ? ( action.result.isOk
    ? updateSettings(model, action.result.value)
    : report(model, action.result.error)
    )
  : action.type === 'Changed'
  ? ( action.result.isOk
    ? updateSettings(model, action.result.value)
    : report(model, action.result.error)
    )
  : Unknown.update(model, action)
  );

/* @flow */

import {Effects, Task} from "reflex"
import {always, asOk, asError} from "../common/prelude"
/*:: import * as type from "../../type/browser/updater" */

const second = 1000;
const minute = 60 * second;

export const initial/*:type.Model*/ = {
  eTag: null,
  pollInterval: 10 * minute,
  latestApplicationVersion: null,
  applicationVersion: null,
  updateURI: 'https://api.github.com/repos/mozilla/browser.html/contents/HEAD?ref=refs/heads/gh-pages',

  isApplicationUpdateAvailable: false,
  isRuntimeUpdateAvailable: false
};

export const asApplicationVersion/*:type.asApplicationVersion*/ = version =>
  ({type: "Updater.ApplicationVersion", version})

export const asLatestApplicationVersion/*:type.asLatestApplicationVersion*/
  = (eTag, pollInterval, version) =>
    ({type: "Updater.LatestApplicationVersionResponse", eTag, pollInterval, version});

export const ApplicationUpdateUnavailable/*:type.ApplicationUpdateUnavailable*/ = {
  type: "Updater.ApplicationUpdateUnavailable"
};

export const asApplicationUpdateUnavailable/*:type.asApplicationUpdateUnavailable*/
  = always(ApplicationUpdateUnavailable);


export const RuntimeUpdateAvailable/*:type.RuntimeUpdateAvailable*/ = {
  type: "Updater.RuntimeUpdateAvailable"
};

export const asRuntimeUpdateAvailable/*:type.asRuntimeUpdateAvailable*/
  = always(RuntimeUpdateAvailable);


export const CheckApplicationUpdate/*:type.CheckApplicationUpdate*/ = {
  type: "Updater.CheckApplicationUpdate"
}

export const asCheckApplicationUpdate/*:type.asCheckApplicationUpdate*/
  = always(CheckApplicationUpdate);

export const CheckRuntimeUpdate/*:type.CheckRuntimeUpdate*/ = {
  type: "Updater.CheckRuntimeUpdate"
}

export const asCheckRuntimeUpdate/*:type.asCheckRuntimeUpdate*/
  = always(CheckRuntimeUpdate)

const requestApplicationVersion = () =>
  Effects.task(Task.future(() => fetch('HEAD').
    then(response => {
      if (response.status === 200) {
        return response
          .text()
          .then(asApplicationVersion)
          .then(asOk)
          .catch(String)
          .then(asError)
      } else {
        return asError(`Failed to fetch local HEAD: ${response.statusText}`)
      }
    })))

const decodeAvailableVersion = (eTag, pollInterval) => json =>
  (json != null && json.data != null && json.data.content != null) ?
    asOk(asLatestApplicationVersion(eTag, pollInterval, json.data.content.toString())) :
    asError(`Failed to fetch application version`);


const asAvailableAppVersion = (eTag, pollInterval) => version =>
  ({type: "Updater.AvailableAppVersion", eTag, pollInterval, version});

const checkApplicationUpdate/*:type.checkApplicationUpdate*/ = (uri, eTag) =>
  Effects.task(Task.future(() => {
    const headers = {}
    // will tell github to return 304 (Not Modified) if nothing changed
    if (eTag != null) {
      headers['If-None-Match'] = eTag;
    }

    return fetch(uri, {headers})
      .then(response => {
        if (response.status === 200) {
          const eTag = response.headers.get('ETag');
          const xPoll = response.headers.get('X-Poll-Interval');
          const pollInterval = typeof(xPoll) === "string" ?
            parseInt(xPoll) * second :
            initial.pollInterval;

          return response
            .json()
            .then(decodeAvailableVersion(eTag, pollInterval))
            .catch(String)
            .then(asError)
        } else if (response.status === 304) {
          return asOk(ApplicationUpdateUnavailable)
        } else {
          return asError(`Failed to check remote updates ${response.statusText}`)
        }
      })
  }));

const scheduleApplicationUpdateCheck/*:type.scheduleApplicationUpdateCheck*/
  = (time) =>
    Effects.task(Task.sleep(time).map(asCheckApplicationUpdate))

const notifyRuntimeUpdate/*:type.notifyRuntimeUpdate*/
  = Effects.task(Task.io(deliver => {
    // TODO: Implement code to listen for runtime update event.
  }))

const checkRuntimeUpdate/*:type.checkRuntimeUpdate*/
  = Effects.task(Task.io(deliver => {
    // TODO: Implement code to trigger runtime event.
  }))

export const initilize/*:type.initilize*/
  = (uri) => [
      uri == null ?
        initial :
        merge(initial, {uri}) ,
      Effects.batch([
        requestApplicationVersion(),
        checkApplicationUpdate(uri == null ? initial.updateURI : uri, null),
        notifyRuntimeUpdate()
      ])
    ]


export const step/*:type.step*/ = (((model, action) => {
  if (action.type === "Error") {
    // TODO: Should distinguish between error coming from `requestApplicationVersion`
    // and `checkApplicationUpdate` to try over appropriate task. For now just do
    // nothing.
    console.error(action.error);
    return [model, Effects.none];
  } else if (action.type === "Ok") {
    const response = action.value
    if (response.type === "Updater.ApplicationUpdateUnavailable") {
      return [
        model,
        model.isApplicationUpdateAvailable ?
          Effects.none :
          scheduleApplicationUpdateCheck(model.pollInterval)
      ]
    } else if (response.type === "Updater.LatestApplicationVersionResponse") {
      const isApplicationUpdateAvailable
        = model.applicationVersion != null &&
          model.applicationVersion !== response.version;

      return [
        merge(model, {
          eTag: response.eTag,
          pollInterval: response.pollInterval,
          latestApplicationVersion: response.version,
          isApplicationUpdateAvailable
        }),
        isApplicationUpdateAvailable ?
          Effects.none :
          scheduleApplicationUpdateCheck(model.pollInterval)
      ]
    } else /*if (response.type === "Updater.ApplicationVersion")*/ {
      return [
        merge(model, {
          applicationVersion: response.version,
          isApplicationUpdateAvailable: model.latestApplicationVersion != null &&
                                        model.latestApplicationVersion !== response.version
        }),
        Effects.none
      ]
    }
  }
  else if (action.type === "Updater.RuntimeUpdateAvailable") {
    return [
      merge(model, {isRuntimeUpdateAvailable: true}),
      Effects.none
    ]
  } else if (action.type === "Updater.CheckApplicationUpdate") {
    return [
      model,
      model.isApplicationUpdateAvailable ?
        Effects.none :
        checkApplicationUpdate(model.updateURI, model.eTag)
    ]
  } else /*if (action.type === "Updater.CheckRuntimeUpdate")*/ {
    return [
      model,
      model.isRuntimeUpdateAvailable ?
        Effects.none :
        checkRuntimeUpdate()
    ]
  }
})/*:any*/);

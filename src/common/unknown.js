/* @flow */

/*:: import * as type from "../../type/common/unknown" */

import {Effects, Task} from "reflex";

export const warn/*:type.warn*/ = (...params) => Task.io(respond => {
  console.warn(...params);
});

export const log/*:type.log*/ = (...params) => Task.io(respond => {
  console.log(...params);
});

export const error/*:type.error*/ = (...params) => Task.io(respond => {
  console.error(...params);
});


export const update/*:type.update*/ = (model, action) => {
  console.warn('Unknown action was passed & ignored: ', action);
  return [model, Effects.none];
};

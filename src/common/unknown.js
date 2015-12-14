/* @flow */

import {Effects, Task} from "reflex";

export const warn = (...params) => Task.io(respond => {
  console.warn(...params);
});

export const log = (...params) => Task.io(respond => {
  console.log(...params);
});

export const error = (...params) => Task.io(respond => {
  console.error(...params);
});


export const step = (model, action) => {
  console.warn('Unknown action was passed & ignored: ', action);
  return [model, Effects.none];
};

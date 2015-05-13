/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const Step = (task, handler="next") => result => {
    try {
      return task[handler](result);
    } catch (error) {
      return {error}
    }
  }


  const spawn = function(routine, ...params) {
    return new Promise((resolve, reject) => {
      const task = routine.call(this, ...params);
      const raise = Step(task, "throw")
      const next = Step(task, "next");

      const resume = ({done, error, value}) => {
        if (error) {
          reject(error);
        }
        else if (done) {
          resolve(value);
        }
        else {
          Promise.
          resolve(value).
          then(next, raise).
          then(resume);
        }
      };

      resume(next());
    });
  };
  exports.spawn = spawn;

  const async = routine => function(...params) {
    return spawn.call(this, routine, ...params);
  };
  exports.async = async;

});

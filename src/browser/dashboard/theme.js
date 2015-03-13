/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const {expandCustomTheme} = require('../theme.js');

  const freeze = Object.freeze;

  // Like `array.reduce` but for objects.
  const reducekv = (object, step, value) => {
    for (let key of Object.keys(object)) {
      value = step(value, key, object[key]);
    }
    return value;
  }

  const hardcodedThemes = freeze({
    'default': {
      backgroundColor: '#222',
      forgroundColor: '#fff',
      isDark: true,
      wallpaper: freeze({
        backgroundColor: '#222',
        forgroundColor: '#fff',
        posterImage: null
      })
    }
  });

  const getTheme = key =>
    hardcodedThemes[key] ? hardcodedThemes[key] : hardcodedThemes.default;

  // Returns an object that can be used to patch `immutableState.dashboard` via
  // `merge`. We happen to use the same datastructure for our hardcoded themes
  // so right now this is just a proxy for `getTheme`. If that changes,
  // change this function.
  const getDashboardPatch = getTheme;

  const stepSwatch = (array, key, theme) => {
    array.push({key: key, backgroundColor: theme.wallpaper.backgroundColor});
    return array;
  }

  // Returns array of swatch objects, each representing a wallpaper.
  // Used for the wallpaper picker swatches.
  const getWallpaperSwatches = () => reducekv(hardcodedThemes, stepSwatch, []);

  // Returns a style object to be applied to Dashboard.
  const readDashboardTheme = (dashboard) => {
    const wallpaper = dashboard.get('wallpaper');
    const backgroundColor = wallpaper.get('backgroundColor');
    const backgroundImage = wallpaper.get('posterImage') || 'none';
    return {
      backgroundColor,
      backgroundImage: `url(${backgroundImage})`,
      color: dashboard.get('forgroundColor')
    };
  }

  const readDashboardNavigationTheme = (dashboard) => expandCustomTheme(
    dashboard.get('forgroundColor'),
    dashboard.get('backgroundColor'),
    dashboard.get('isDark')
  );

  // Exports:

  exports.getDashboardPatch = getDashboardPatch;
  exports.getWallpaperSwatches = getWallpaperSwatches;
  exports.readDashboardTheme = readDashboardTheme;
  exports.readDashboardNavigationTheme = readDashboardNavigationTheme;

});

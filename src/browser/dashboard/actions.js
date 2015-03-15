/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const {expandCustomTheme} = require('../theme.js');

  // Like `array.reduce` but gives you access to keys and values of object.
  const reducekv = (object, step, value) =>
    Object.keys(object).reduce((value, key) =>
      step(value, key, object[key]), value);

  const hardcodedThemes = {
    'default': {
      navigation: {
        backgroundColor: null,
        foregroundColor: null,
        isDark: false,
      },
      wallpaper: {
        backgroundColor: '#F0F4F7',
        foregroundColor: null,
        posterImage: null
      }
    },
    'dark': {
      navigation: {
        backgroundColor: '#2E434B',
        foregroundColor: '#eee',
        isDark: true,
      },
      wallpaper: {
        backgroundColor: '#25363D',
        foregroundColor: '#eee',
        posterImage: null
      }
    },
    'shore': {
      navigation: {
        backgroundColor: '#078',
        foregroundColor: '#eee',
        isDark: true,
      },
      wallpaper: {
        backgroundColor: '#078',
        foregroundColor: 'rgb(255,255,255)',
        posterImage: 'wallpaper/shore.jpg'
      }
    },
    'dandilion': {
      navigation: {
        backgroundColor: '#112935',
        foregroundColor: '#eee',
        isDark: true,
      },
      wallpaper: {
        backgroundColor: '#134',
        foregroundColor: 'rgb(255,255,255)',
        posterImage: 'wallpaper/dandilion.jpg'
      }
    },
    'dock': {
      navigation: {
        backgroundColor: '#437',
        foregroundColor: '#fff',
        isDark: true,
      },
      wallpaper: {
        backgroundColor: '#437',
        foregroundColor: 'rgb(255,255,255)',
        posterImage: 'wallpaper/dock.jpg'
      }
    },
  };

  // Returns an object that can be used to patch `immutableState.dashboard` via
  // `merge`. We happen to use the same datastructure for our hardcoded themes.
  // If that changes, change this function.
  const getDashboardThemePatch = key => {
    const theme = hardcodedThemes[key] ?
      hardcodedThemes[key] : hardcodedThemes.default;
    const navigation = Object.assign({}, theme.navigation);
    const wallpaper = Object.assign({}, theme.wallpaper);
    return {navigation, wallpaper};
  }

  // Use to initialize wallpaper in `immutableState`.
  const initDashboard = options => Object.assign(
    getDashboardThemePatch('default'),
    options
  );

  const stepSwatch = (array, key, theme) => {
    array.push({key, backgroundColor: theme.wallpaper.backgroundColor});
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
    const foregroundColor = wallpaper.get('foregroundColor');
    return {
      backgroundColor,
      backgroundImage: `url(${backgroundImage})`,
      color: foregroundColor
    };
  }

  const readDashboardNavigationTheme = dashboard => {
    const navigation = dashboard.get('navigation');
    return expandCustomTheme(
      navigation.get('foregroundColor'),
      navigation.get('backgroundColor'),
      navigation.get('isDark')
    );
  }

  // Exports:

  exports.getDashboardThemePatch = getDashboardThemePatch;
  exports.getWallpaperSwatches = getWallpaperSwatches;
  exports.readDashboardTheme = readDashboardTheme;
  exports.readDashboardNavigationTheme = readDashboardNavigationTheme;
  exports.initDashboard = initDashboard;

});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const {getDomainName} = require('common/url-helper');
  const {Record, Maybe} = require('typed-immutable/index');

  const DARK = true;
  const hardcodedColors = {
    // [foreground, background]
    'youtube.com': ['#cc181e', '#fff', !DARK],
    'yahoo.com': ['#2d1152', '#fff', !DARK],
    'facebook.com': ['#fff', '#3A5795', DARK],
    'biadu.com': ['#2529d8', '#fff', !DARK],
    'amazon.com': ['#e47911', '#fff', !DARK],
    'taobao.com': ['#ff4400', '#fff', !DARK],
    'qq.com': ['#5da4e6', '#fff', !DARK],
    'sina.com.cn': ['#fff', '#ff8500', DARK],
    'instagram.com': ['#fff', '#5380a5', DARK],
    'imgur.com': ['#fff', '#2b2b2b', DARK],
    'cnn.com': ['#fff', '#0c0c0c', DARK],
    'slideshare.net': ['#fff', '#313131', DARK],
    'deviantart.com': ['#fff', '#475c4d', DARK],
    'soundcloud.com': ['#fff', '#383838', DARK],
    'mashable.com': ['#fff', '#00aeef', DARK],
    'daringfireball.net': ['#fff', '#4a525a', DARK],
    'firewatchgame.com': ['#EF4338', '#2D102B', DARK],
    'whatliesbelow.com': ['#fff', '#74888B', DARK],
    'supertimeforce.com': ['#2EBCEC', '#051224', DARK]
  };

  const Color = String;

  const ThemeElement = Record({
    backgroundColor: Maybe(Color),
    color: Maybe(Color)
  });

  const Theme = Record({
    isDark: false,
    glyphsShowing: false,

    windowCloseButton: ThemeElement({
      backgroundColor: '#FC5753'
    }),
    windowMinButton: ThemeElement({
      backgroundColor: '#FDBC40'
    }),
    windowMaxButton: ThemeElement({
      backgroundColor: '#33C748'
    }),
    reloadButton: ThemeElement({
      color: 'rgba(0,0,0,0.5)'
    }),
    stopButton: ThemeElement({
      color: 'rgba(0,0,0,0.5)'
    }),
    backButton: ThemeElement({
      color: 'rgba(0,0,0,0.5)'
    }),
    urlInput: ThemeElement({
      color: 'rgba(0,0,0,0.65)'
    }),
    locationBar: ThemeElement({
      backgroundColor: '#E1E9F0'
    }),
    locationText: ThemeElement({
      color: 'rgba(0,0,0, 0.65)'
    }),
    titleText: ThemeElement({
      color: 'rgba(0,0,0,0.5)'
    }),
    pageInfoText: ThemeElement({
      color: 'rgba(0,0,0,0.5)'
    }),
    tabstrip: ThemeElement({
      backgroundColor: '#fff'
    }),
    navigationPanel: ThemeElement({
      backgroundColor: '#fff'
    }),
    progressbar: ThemeElement({
      color: '#82D3FD'
    }),
    awesomebarSuggestions: ThemeElement({
      backgroundColor: '#fff',
      color: 'rgba(0,0,0, 0.65)'
    })
  });
  Theme.default = Theme();

  // Expands `foregroundColor`, `backgroundColor` and `isDark` into a full theme
  // object you can use in React views.
  //
  // `foregroundColor`: any valid CSS color string or null.
  // `backgroundColor`: any valid CSS color string or null.
  // `isDark`: boolean. Used to change background of location field.
  //
  // If either foreground or background is null, will fall back to default theme.
  // Returns a theme object.
  Theme.read = ({foregroundColor, backgroundColor, isDark}) => Theme({
    isDark: isDark,
    windowCloseButton: {backgroundColor: foregroundColor},
    windowMinButton: {backgroundColor: foregroundColor},
    windowMaxButton: {backgroundColor: foregroundColor},
    reloadButton: {color: foregroundColor},
    stopButton: {color: foregroundColor},
    backButton: {color: foregroundColor},
    urlInput: {color: foregroundColor},
    locationBar: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.07)'
    },
    locationText: {color: foregroundColor},
    titleText: {color: foregroundColor},
    pageInfoText: {color: foregroundColor},
    tabstrip: {backgroundColor},
    navigationPanel: {backgroundColor},
    progressbar: {color: foregroundColor},
    awesomebarSuggestions: {
      backgroundColor: backgroundColor,
      color: foregroundColor
    }
  });

  // Used to create a state patch for `webView`.
  // @FIXME this is a temporary measure until we have the full color matching
  // fallbacks in place.
  Theme.fromURI = (uri) => {
    const hostname = getDomainName(uri);
    const colors = hardcodedColors[hostname];
    if (colors) {
      const [foregroundColor, backgroundColor, isDark] =  colors;
      return Theme.read({foregroundColor, backgroundColor, isDark});
    }
    return Theme.default;
  };

  module.exports = Theme;
});

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

  const Pallet = Record({
    isDark: false,
    foreground: Maybe(Color),
    background: Maybe(Color)
  }, 'Pallet');
  exports.Pallet = Pallet;

  const Theme = Record({
    isDark: false,
    glyphsShowing: false,

    // reload, stop, back button color.
    controlButton: Color('rgba(0,0,0,0.5)'),

    closeButton: Color('#FC5753'),
    minButton: Color('#FDBC40'),
    maxButton: Color('#33C748'),

    inputText: Color('rgba(0,0,0,0.65)'),
    locationText: Color('rgba(0,0,0, 0.65)'),
    titleText: Color('rgba(0,0,0,0.5)'),
    locationBar: Color('#E1E9F0'),

    shell: Color('#fff'),
    shellText: Color('rgba(0,0,0, 0.65)'),

    progressBar: Color('#82D3FD')
  }, 'Theme');

  exports.Theme = Theme;


  exports.read = pallet => {
    const foreground = pallet.foreground || void(0);
    const background = pallet.background || void(0);
    return Theme({
      isDark: pallet.isDark,

      closeButton: foreground,
      minButton: foreground,
      maxButton: foreground,

      controlButton: foreground,

      inputText: foreground,
      locationText: foreground,
      titleText: foreground,
      locationBar: pallet.isDark ? 'rgba(255,255,255,0.15)' :
                   'rgba(0,0,0,0.07)',

      shell: background,
      shellText: foreground,

      progressBar: foreground
    });
  };
});

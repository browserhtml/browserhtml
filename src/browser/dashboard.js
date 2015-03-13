/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {
  'use strict';

  const {DOM} = require('react')
  const Component = require('omniscient');
  const {Deck} = require('./deck');
  const {Wallpaper, WallpaperSwatches} = require('./wallpaper');
  const {readDashboardTheme, readWallpaperTheme,
         getWallpaperSwatches} = require('./dashboard/theme');

  const readBackground = uri => ('none' && `url(${uri})`);

  const DashboardTile = Component('DashboardTile',
    ({key, uri, image, title}, {onOpen}) =>
    DOM.div({key,
             onClick: event => onOpen(uri),
             className: 'tile tile-large'}, [
             DOM.div({key: 'tileThumbnail',
                      className: 'tile-thumbnail',
                      style: {backgroundImage: readBackground(image)}}),
             DOM.div({key: 'tileTitle',
                      className: 'tile-title'}, null, title)]));

  const DashboardTiles = (options, handlers) =>
    DOM.div(options, options.items.map(item =>
      DashboardTile({
        key: item.get('uri'),
        uri: item.get('uri'),
        image: item.get('image'),
        title: item.get('title')
      }, handlers)));

  const Dashboard = Component('Dashboard',
    ({dashboard, hidden}, {onOpen, onWallpaperChange}) =>
    DOM.div({
      style: readDashboardTheme(dashboard),
      className: 'dashboard',
      hidden
    }, [
      Wallpaper({
        key: 'wallpaper',
        className: 'wallpaper',
        wallpaper: readWallpaperTheme(dashboard)
      }, {onWallpaperChange}),
      DashboardTiles({
        key: 'dashboard-tiles',
        className: 'dashboard-tiles',
        items: dashboard.get('items')
      }, {onOpen}),
      WallpaperSwatches({
        key: 'wallpaper-swatches',
        className: 'wallpaper-swatches',
        items: getWallpaperSwatches()
      }, {onWallpaperChange})
    ]));

  // Exports:

  exports.Dashboard = Dashboard;

});

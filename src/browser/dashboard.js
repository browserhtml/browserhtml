/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const {html, render} = require('reflex')
  const {Record, Union, List, Maybe} = require('common/typed');
  const WebView = require('./web-view');


  // Model

  const URI = String;
  const Path = String;

  const Page = Record({
    uri: URI,
    image: Path,
    title: String
  }, 'Dashboard.Page');
  Page.key = page => page.uri;

  const Color = String;

  const Wallpaper = Record({
    backgroundColor: Maybe(Color),
    foregroundColor: Maybe(Color),
    posterImage: Maybe(Path)
  }, 'Dashboard.Theme.Wallpaper')

  const Theme = Record({
    id: String ,
    wallpaper: Wallpaper,
    navigation: Record({
      backgroundColor: Maybe(Color),
      foregroundColor: Maybe(Color),
      isDark: false
    })
  }, 'Dashboard.Theme');

  const Model = Record({
    themes: Record({
      selected: 0,
      entries: List(Theme)
    }),
    pages: List(Page)
  }, 'Dashboard');

  exports.Theme = Theme;
  exports.Page = Page;
  exports.Model = Model;

  // Actions

  const {Open} = WebView;
  const ChangeTheme = Record({id: String}, 'Dashboard.ChangeTheme');

  const Action = Union({ChangeTheme});

  exports.Action = Action;

  // Update

  const setTheme = (themes, id) =>
    themes.set('selected', themes.entries.findIndex(theme => id === theme.id));

  const update = (state, {constructor, id}) =>
    constructor === ChangeTheme ? state.set('themes',
                                            setTheme(state.themes, id)) :
    state;
  exports.update = update;

  // View

  const viewTheme = ({id, wallpaper}, address) => html.div({
    key: id,
    className: 'wallpaper-swatch',
    style: {backgroundColor: wallpaper.backgroundColor},
    onClick: address.send(ChangeTheme({id}))
  });

  const viewPage = ({uri, image, title}, address) => html.div({
    key: uri,
    className: 'tile tile-large',
    onClick: address.send(Open({uri})),
  }, [
    html.div({
      key: 'tileThumbnail',
      className: 'tile-thumbnail',
      style: {backgroundImage: image && `url(${image})`}
    }),
    html.div({
      key: 'tileTitle',
      className: 'tile-title'
    }, title)
  ]);

  const view = ({themes, pages}, isSelected, address) => {
    const theme = themes.entries.get(themes.selected);
    return html.div({
      key: 'dashboard',
      hidden: !isSelected,
      className: 'dashboard',
      style: theme && {
        backgroundColor: theme.wallpaper.backgroundColor,
        color: theme.wallpaper.foregroundColor,
        backgroundImage: theme.wallpaper.posterImage &&
                         `url(${theme.wallpaper.posterImage})`
      }
    }, [
      html.div({
        key: 'dashboard-tiles',
        className: 'dashboard-tiles'
      }, pages.map(page => render(page.url, viewPage, page, address))),
      html.div({
        key: 'wallpaper-swatches',
        className: 'wallpaper-swatches',
      }, themes.entries.map(theme => render(theme.id, viewTheme, theme, address)))
    ]);
  };
  // Exports:

  exports.view = view;
});

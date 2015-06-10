/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const {Record, Any, Union} = require('typed-immutable/index');
  const WebView = require('./web-view');

  // Action

  const SaveSession = Record({
    name: '@save-session'
  }, 'Session.SaveSession')();

  const RestoreSession = Record({
    name: '@restore-session'
  }, 'Session.RestoreSession')();

  const ResetSession = Record({
    name: '@reset-session'
  }, 'Session.ResetSession')();

  const Action = Union(SaveSession, RestoreSession, ResetSession);
  Action.SaveSession = SaveSession;
  Action.RestoreSession = RestoreSession;
  Action.ResetSession = ResetSession;

  Action.isTypeOf = action =>
    action === SaveSession ||
    action === RestoreSession ||
    action === ResetSession;

  exports.Action = Action;

  const pages = [
    {image: 'tiles/facebook.com.png',
     uri: 'https://facebook.com',
     title: 'facebook.com'},
    {image: 'tiles/youtube.com.png',
     uri: 'https://youtube.com',
     title: 'youtube.com'},
    {image: 'tiles/amazon.com.png',
     uri: 'https://amazon.com',
     title: 'amazon.com'},
    {image: 'tiles/wikipedia.org.png',
     uri: 'https://wikipedia.org',
     title: 'wikipedia.org'},
    {image: 'tiles/twitter.com.png',
     uri: 'https://twitter.com',
     title: 'twitter.com'},
    {image: 'tiles/mail.google.com.png',
     uri: 'https://mail.google.com',
     title: 'mail.google.com'},
    {image: 'tiles/nytimes.com.png',
     uri: 'https://nytimes.com',
     title: 'nytimes.com'},
    {image: 'tiles/qz.com.png',
     uri: 'http://qz.com',
     title: 'qz.com'},
    {image: 'tiles/github.com.png',
     uri: 'https://github.com',
     title: 'github.com'},
    {image: 'tiles/dropbox.com.png',
     uri: 'https://dropbox.com',
     title: 'dropbox.com'},
    {image: 'tiles/linkedin.com.png',
     uri: 'https://linkedin.com',
     title: 'linkedin.com'},
    {image: 'tiles/yahoo.com.png',
     uri: 'https://yahoo.com',
     title: 'yahoo.com'}
  ];

  const themes = [
    {
      id: 'default',
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
    {
      id: 'dark',
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
    {
      id: 'shore',
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
    {
      id: 'dandilion',
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
    {
      id: 'dock',
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
    }
  ]

  exports.update = (state, action) => {
    if (action === SaveSession) {
      const session = state
        .updateIn(['webViews', 'entries'],
                   entries => entries.map(entry =>
                      entry.update('view', WebView.persistent)))
        .remove('updates')
        .toJSON();

      localStorage[`session@${state.version}`] = JSON.stringify(session);

      return state;
    }

    if (action === ResetSession) {
      return state.clear().merge({
        shell: {isFocused: document.hasFocus()},
        dashboard: {pages, themes: {entries: themes}},
        webViews: {
          entries: [
            {
              view: {
                id: 'about:dashboard',
                isPinned: true,
                isFocused: true
              }
            }
          ]
        }
      });
    }

    if (action === RestoreSession) {
      const session = localStorage[`session@${state.version}`];
      if (session) {
        try {
          return state.clear().merge(JSON.parse(session));
        } catch (error) {
          console.error(`Failed to restore a session`, error);
        }
      } else {
        console.error('Compatible session was not found, loading default');
        return exports.update(state, ResetSession);
      }
    }

    return state
  };


});

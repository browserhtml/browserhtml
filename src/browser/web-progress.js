/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const {Record, Union} = require('common/typed');
  const {StyleSheet, Style} = require('common/style');
  const {html, render} = require('reflex');
  const Loader = require('./web-loader');

  // Model
  const Model = Record({
    loadStarted: false,
    loadEnded: false,
  });
  exports.Model = Model;

  // Action

  const LoadStarted = Record({
    uri: String,
  }, 'Progress.LoadStarted');
  exports.LoadStarted = LoadStarted;

  const LoadEnded = Record({
    uri: String,
  }, 'Progress.LoadEnded');
  exports.LoadEnded = LoadEnded;

  // Update

  const update = (state, action) =>
    action instanceof Loader.Load ?
      state.clear() :
    action instanceof LoadStarted ?
      Model({loadStarted: true, loadEnded: false}) :
    action instanceof LoadEnded ?
      Model({loadStarted: true, loadEnded: true}) :
    state;
  exports.update = update;

  // View

  const barStyle = StyleSheet.create({
    base: {
      height: 4,
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      transitionProperty: 'transform, opacity',
      transitionDuration: '300ms, 200ms',
      transitionTimingFunction: 'ease-out',
      transitionDelay: '0s, 300ms',

      animationDuration: '10s',
      animationTimingFunction: 'cubic-bezier(0, 0.5, 0, 0.5)',

      transform: 'translateX(-100vw)',
      opacity: 0,
    },
    hidden: {
      visibility: 'hidden'
    },
    visible: {
      visibility: 'visible'
    },
    loading: {
      animationName: 'progressBarLoading'
    },
    loaded: {
      transform: 'translateX(0vw)',
      opacity: 0
    }
  });

  const arrowStyle = StyleSheet.create({
    base: {
      width: 4,
      height: 4,
      float: 'right',
      marginRight: -4
    }
  });

  const progressbarView = (id, progress, isSelected, theme) => {
    return html.div({
      key: `progressbar-${id}`,
      style: Style(barStyle.base,
                   !isSelected ? barStyle.hidden : barStyle.visible,
                   progress.loadEnded ? barStyle.loaded : barStyle.loading, {
                     backgroundColor: theme.progressBar
                   }),
    }, [html.div({
      key: `progressbar-arrow-${id}`,
      style: Style(arrowStyle.base, {
        backgroundImage: `linear-gradient(135deg, ${theme.progressBar} 50%, transparent 50%)`,
      })
    })]);
  };

  const containerStyle = StyleSheet.create({
    base: {
      position: 'absolute',
      top: 28,
      left: 0,
      width: '100vw',
      height: 4,
      overflow: 'hidden',
      pointerEvents: 'none',
    }
  });

  const view = (mode, loaders, progress, selected, theme) => {
    return html.div({
      key: 'progressbars',
      style: containerStyle.base
    }, loaders.map((loader, index) =>
      render(`progressbar@${loader.id}`, progressbarView,
             loader.id,
             progress.get(index),
             // If not in show-web-view pass -1 to hide all progressbars.
             mode === 'show-web-view' && index === selected,
             theme)));
  };

  exports.view = view;

});

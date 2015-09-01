/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  'use strict';

  const {Record, Union, List, Maybe, Any} = require('typed-immutable');
  const {html, render} = require('reflex');
  const {StyleSheet, Style} = require('../common/style');
  const URI = require('../common/url-helper');
  const Editable = require('../common/editable');
  const Focusable = require('../common/focusable');
  const IFrame = require('./iframe');
  const Progress = require('./web-progress');
  const Shell = require('./web-shell');
  const Navigation = require('./web-navigation');
  const Security = require('./web-security');
  const Page = require('./web-page');
  const Loader = require('./web-loader');
  const Selector = require('../common/selector');
  const Force = require('../service/force');
  const Card = require('./web-card');
  const Sheet = require('./web-sheet');
  const {animate} = require('../common/animation');
  const {Element, BubbledEvent, CapturedEvent} = require('../common/element');

  // Model
  const Model = Record({
    selected: Maybe(Number),
    previewed: Maybe(Number),
    nextID: 0,

    loader: List(Loader.Model),
    shell: List(Shell.Model),
    page: List(Page.Model),
    progress: List(Progress.Model),
    navigation: List(Navigation.Model),
    security: List(Security.Model),
    card: List(Card.Model),
    sheet: List(Sheet.Model)
  }, 'WebViews');
  exports.Model = Model;

  const get = (state, index) => ({
    loader: state.loader.get(index),
    shell: state.shell.get(index),
    page: state.page.get(index),
    progress: state.progress.get(index),
    navigation: state.navigation.get(index),
    security: state.security.get(index),
    card: state.card.get(index),
    sheet: state.sheet.get(index)
  });
  exports.get = get;

  // Actions

  const Failure = Record({
    description: 'WebView failure',
    detail: Any
  }, 'WebView.Failure');
  exports.Failure = Failure;

  const ContextMenu = Record({
    description: 'WebView requested a context menu',
  }, 'WebView.ContextMenu');
  exports.ContextMenu = ContextMenu;

  const ModalPrompt = Record({
    description: 'WebView requested a modal prompt'
  }, 'WebView.ModalPrompt');
  exports.ModalPrompt = ModalPrompt;

  const Authentificate = Record({
    description: 'WebView requested an authentification'
  }, 'WebView.Authentificate');
  exports.Authentificate = Authentificate;

  const Open = Record({
    opener: Any,
    uri: Maybe(String),
    name: '_blank',
    features: ''
  }, 'WebViews.Open');
  exports.Open = Open;

  const OpenInBackground = Record({
    uri: String,
    inBackground: true
  }, 'WebView.OpenInBackground');
  exports.OpenInBackground = OpenInBackground;

  const Close = Record({
    description: 'close selected web view'
  }, 'WebView.Close');
  exports.Close = Close;

  const SelectByID = Record({
    description: 'Select web-view by an id',
    id: String
  }, 'WebViews.SelectByID');
  exports.SelectByID = SelectByID;


  // Just a union type for all possible actions that are targeted at specific
  // web view.
  const Action = Union(
    Close, Open, OpenInBackground,
    Loader.Action, Progress.Action, Navigation.Action, Focusable.Action,
    Page.Action, Security.Action, Shell.Action, Card.Action, Sheet.Action,
    Failure, ContextMenu, ModalPrompt, Authentificate);
  exports.Action = Action;

  // Type contains `id` of the web-view and an `action` that is targeted
  // the web-view that has matching `id`. If `id` is `null` targets currently
  // selected web-view.
  const ByID = Record({
    id: String,
    action: Action
  }, 'WebView.ByID');
  exports.ByID = ByID;

  const BySelected = Record({
    action: Action
  }, 'WebView.BySelected');
  exports.BySelected = BySelected;

  const Select = Record({
    action: Selector.Action
  }, 'WebView.Select');
  exports.Select = Select;

  const Preview = Record({
    action: Selector.Action
  }, 'WebView.Preview');
  exports.Preview = Preview;


  // Update


  const indexByID = (state, id) => {
    const index = state.loader.findIndex(loader => loader.id === id);
    return index < 0 ? null : index;
  };
  exports.indexByID = indexByID;

  // Transformers

  const open = (state, {uri, inBackground, opener}) => activate(state.merge({
    nextID: state.nextID + 1,
    previewed: inBackground ? state.selected + 1 : 0,
    loader: state.loader.unshift(Loader.Model({
      uri, opener, src: uri,
      id: String(state.nextID),
    })),
    shell: state.shell.unshift(Shell.Model({isFocused: !inBackground})),
    page: state.page.unshift(Page.Model()),
    progress: state.progress.unshift(Progress.Model()),
    navigation: state.navigation.unshift(Navigation.Model()),
    security: state.security.unshift(Security.Model()),
    card: state.card.unshift(Card.Model()),
    sheet: state.sheet.unshift(Sheet.init())
  }));
  exports.open = open;

  const closeByIndex = (state, index) =>
    index == null ? state : activate(state.merge({
      previewed: // If view closed is to the right of the previewed one
                 // everything stays as is.
                 index > state.previewed ? state.previewed :
                 // If view closed is to the left of the previewed one
                 // then index of previewed is positive (given that index
                 // is at min 0) so previewed is decremented.
                 index < state.previewed ? state.previewed - 1 :

                 // Otherwise previewed view is being closed.

                 // If it is only view there is no more previewed view so
                 // it is `null`.
                 state.loader.size === 1 ?  null :
                 // If it is a first view new previewed is still the first.
                 index === 0 ? 0 :
                 // otherwise to keep the same view previewed we decrement
                 // (index althoug here it's same as previewd).
                 index - 1,
      loader: state.loader.remove(index),
      shell: state.shell.remove(index),
      page: state.page.remove(index),
      progress: state.progress.remove(index),
      navigation: state.navigation.remove(index),
      security: state.security.remove(index),
      card: state.card.remove(index),
      sheet: state.sheet.remove(index)
    }));
  exports.closeByIndex = closeByIndex;


  const loadByIndex = (state, index, action) => {
    const loader = state.loader.get(index);
    return !loader ?
            open(state, action) :
            changeByIndex(state, index, action);
  };
  exports.loadByIndex = loadByIndex;

  const updateByIndex = (state, n, action) =>
    action instanceof Loader.Load ? loadByIndex(state, n, action) :
    action instanceof Close ? closeByIndex(state, n, action) :
    action instanceof Open ? open(state, action) :
    action instanceof OpenInBackground ? open(state, action) :
    changeByIndex(state, n, action);

  const changeByIndex = (state, n, action) => {
    const {loader, shell, page, progress, navigation, security, card, sheet} = state;
    return n == null ? state : activate(state.merge({
      selected: action instanceof Focusable.Focus ? n :
               action instanceof Focusable.Focused ? n :
               state.selected,
      loader: loader.set(n, Loader.update(loader.get(n), action)),
      shell: shell.set(n, Shell.update(shell.get(n), action)),
      page: page.set(n, Page.update(page.get(n), action)),
      progress: progress.set(n, Progress.update(progress.get(n), action)),
      security: security.set(n, Security.update(security.get(n), action)),
      navigation: navigation.set(n, Navigation.update(navigation.get(n), action)),
      card: card.set(n, Card.update(card.get(n), action)),
      sheet: sheet.set(n, Sheet.update(sheet.get(n), action))
    }));
  };



  const updateSelected = (state, action) =>
    updateByIndex(state, state.selected, action);

  const activate = state =>
    state.set('selected', state.previewed);
  exports.activate = activate;

  const select = (state, action) =>
    activate(state.set('previewed',
                       Selector.indexOf(state.selected,
                                        state.loader.size,
                                        action)));
  exports.select = select;

  const preview = (state, action) =>
    state.set('previewed', Selector.indexOf(state.previewed,
                                            state.loader.size,
                                            action));
  exports.preview = preview;

  const update = (state, action) =>
    action instanceof Select ?
      select(state, action.action) :
    action instanceof Preview ?
      preview(state, action.action) :
    action instanceof ByID ?
      updateByIndex(state, indexByID(state, action.id), action.action) :
    action instanceof BySelected ?
      updateByIndex(state, state.selected, action.action) :
    action instanceof Open ?
      open(state, action) :
    action instanceof OpenInBackground ?
      open(state, action) :
    state;
  exports.update = update;


  // View

  const webviewStyle = StyleSheet.create({
    base: {
      position: 'absolute',
      MozUserSelect: 'none',
      width: '100%',
      height: '100%',
      backgroundColor: '#fff',
      zIndex: 2
    },
    motion: {
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.4)',
    },

    navigationArrow: {
      position: 'absolute',
      zIndex: 1,
      fontFamily: 'FontAwesome',
      fontSize: '60px',
      lineHeight: '60px',
      display: 'inline',
      top: '50%',
      marginTop: '-60px'
    },
    forwardArrow: {
      right: '60px',
      content: '\uf054'
    },
    backArrow: {
      left: '60px',
      content: '\uf053'
    },

    active: {
      zIndex: 2,
    },
    inactive: {
      display: 'none',
    },
    passive: {
      visibility: 'hidden',
    },
    perspective: {
      perspective: '100vw',
      transformStyle: 'preserve-3d',
      height: 'inherit',
      width: 'inherit'
    }
  });

  const swipingDiv = Element('div', {
    onMozSwipeGestureStart: new BubbledEvent('MozSwipeGestureStart'),
    onMozSwipeGestureUpdate: new BubbledEvent('MozSwipeGestureUpdate'),
    onMozSwipeGestureEnd: new BubbledEvent('MozSwipeGestureEnd'),
    onMozSwipeGesture: new BubbledEvent('MozSwipeGesture')
  });

  // See: https://dxr.mozilla.org/mozilla-central/source/dom/interfaces/events/nsIDOMSimpleGestureEvent.idl?offset=100#108-109
  const DIRECTION_LEFT = 4;
  const DIRECTION_RIGHT = 8;

  const viewWebView = (loader, shell, navigation, thumbnail, sheet, isSelected, address) => {
    const node = swipingDiv({
      key: 'web-view',
      style: webviewStyle.perspective,
      onMozSwipeGestureStart: event => {
        if (event.direction === DIRECTION_LEFT ||
            event.direction === DIRECTION_RIGHT)
        {
          event.allowedDirections = DIRECTION_LEFT | DIRECTION_RIGHT;
          event.preventDefault();


          address.receive(Sheet.BeginSwipe({
            delta: event.delta,
            timeStamp: performance.now()
          }));
        }
      },
      onMozSwipeGestureUpdate: (event) => {
        address.receive(Sheet.ContinueSwipe({
          delta: event.delta,
          timeStamp: performance.now()
        }));
      },
      onMozSwipeGestureEnd(event) {
        address.receive(Sheet.ContinueSwipe({
          delta: event.delta,
          timeStamp: performance.now()
        }));
      },
      onMozSwipeGesture: (event) => {
        address.receive(Sheet.EndSwipe({
          timeStamp: performance.now()
        }));
      }
    }, [
      html.figure({
        key: 'goBack',
        style: Style(webviewStyle.navigationArrow,
                     webviewStyle.backArrow,
                     navigation.canGoBack ?
                      {opacity: Math.abs(sheet.value)} :
                      webviewStyle.inactive)
      }, webviewStyle.backArrow.content),
      html.figure({
        key: 'goForward',
        style: Style(webviewStyle.navigationArrow,
                     webviewStyle.forwardArrow,
                     navigation.canGoForward ?
                      {opacity: Math.abs(sheet.value)} :
                      webviewStyle.inactive)
      }, webviewStyle.forwardArrow.content),
      html.div({
        key: 'perspective',
        style: Style(webviewStyle.base,
                     sheet.isInMotion ? webviewStyle.motion : null,
                     sheet.isInMotion ? {
                        transform: `rotateY(${sheet.angle}deg)
                                    translateZ(${sheet.z}px)
                                    translateX(${sheet.x}px)`
                     } : null,
                     (sheet.isInMotion && !sheet.isForced) ? {
                       transition: `${sheet.releaseDuration}ms transform ease-out`
                     } : null),
      }, viewWebFrame(loader, shell, navigation, thumbnail, isSelected, address))
    ]);

    return animate(node, event => {
      address.receive(sheet.action);
      address.receive(Sheet.AnimationFrame(event));
    }, sheet.isInMotion);
  };

  const viewWebFrame = (loader, shell, navigation, thumbnail, isSelected, address) => {
    // Do not render anything unless viewer has an `uri`
    if (loader.uri == null) return null;

    const action = address.pass(Event);
    const location = URI.resolve(loader.src);

    return IFrame.view({
      id: `web-view-${loader.id}`,
      src: location,
      'data-uri': loader.uri,
      opener: loader.opener,
      className: `web-view ${isSelected ? 'selected' : ''}`,
      // This is a workaround for Bug #266 that prevents capturing
      // screenshots if iframe or it's ancesstors have `display: none`.
      // Until that's fixed on platform we just hide such elements with
      // negative index and absolute position.
      style: Style(webviewStyle.base,
                   isSelected ? webviewStyle.active :
                   !thumbnail ? webviewStyle.passive :
                   webviewStyle.inactive),
      mozbrowser: true,
      remote: true,
      mozapp: URI.isPrivileged(location) ? URI.getManifestURL().href : null,
      mozallowfullscreen: true,
      isVisible: isSelected || !thumbnail,
      zoom: shell.zoom,
      task: navigation.task,

      isFocused: shell.isFocused,

      onCanGoBackChanged: action,
      onCanGoForwardChanged: action,
      onBlur: action,
      onFocus: action,
      // onAsyncScroll: action
      onClose: action,
      onOpenWindow: action,
      onOpenTab: action,
      onMenu: action,
      onError: action,
      onLoadStarted: action,
      onLoadEnded: action,
      onFirstPaint: action,
      onDocumentFirstPaint: action,
      onLoadProgressChange: action,
      onLocationChanged: action,
      onMetaChanged: action,
      onIconChanged: action,
      onLocationChanged: action,
      onSecurityChanged: action,
      onTitleChanged: action,
      onPrompt: action,
      onAuthentificate: action,
      onScrollAreaChange: action,
    });
  };
  exports.viewWebView = viewWebView;

  const webviewsStyle = StyleSheet.create({
    base: {
      width: '100%',
      height: '100%',
      position: 'relative',
    },
    fadeIn: {
      transition: 'opacity 100ms linear',
      transform: 'scale(1)',
      opacity: 1,
    },
    fadeOut: {
      transition: 'transform 0ms linear 100ms, opacity 100ms linear',
      transform: 'scale(0)',
      opacity: 0,
      pointerEvents: 'none',
    },
    grow: {
      transition: 'transform 200ms linear, opacity 200ms linear',
      transform: 'scale(1)',
      opacity: 1,
    },
    shrink: {
      transition: 'transform 200ms linear, opacity 150ms linear',
      transform: 'scale(0)',
      opacity: 0,
      pointerEvents: 'none',
    },
    hide: {
      transform: 'scale(0)',
      opacity: 0,
      pointerEvents: 'none'
    }
  });

  // Given a mode and transition, returns appropriate style object.
  const getModeStyle =  (mode, transition) =>
    (mode === 'show-web-view' && transition === 'fade') ?
      webviewsStyle.fadeIn :
    (mode === 'show-web-view' && transition === 'zoom') ?
      webviewsStyle.grow :
    (mode === 'create-web-view' && transition === 'fade') ?
      webviewsStyle.fadeOut :
    mode === 'select-web-view' ?
      webviewsStyle.fadeOut :
    (mode === 'edit-web-view' && !transition) ?
      webviewsStyle.hide :
    (mode === 'edit-web-view' && transition === 'fade') ?
      webviewsStyle.fadeOut :
    webviewsStyle.shrink;

  const view = (mode, transition, loader, shell, navigation, page, sheet, address, selected) =>
    html.div({
      key: 'web-views',
      style: Style(webviewsStyle.base, getModeStyle(mode, transition)),
    }, loader.map((loader, index) =>
      render(`web-view@${loader.id}`, viewWebView,
             loader,
             shell.get(index),
             navigation.get(index),
             page.get(index).thumbnail,
             sheet.get(index),
             index === selected,
             address.forward(action =>
               // If action is boxed in Force.Action we want to keep it
               // that way.
               action instanceof Force.Action ?
                action.set('action', ByID({id: loader.id,
                                           action: action.action})) :
                ByID({id: loader.id, action})))));
  exports.view = view;

  // Actions that web-view produces but `update` does not handles.



  const Event = event =>
    Event[event.type](event);

  Event.mozbrowserdocumentfirstpaint = event =>
    Page.DocumentFirstPaint();

  Event.mozbrowserfirstpaint = event =>
    Page.FirstPaint();

  Event.mozbrowserlocationchange = ({detail: uri, timeStamp}) =>
    Loader.LocationChanged({uri, timeStamp});

  // TODO: Figure out what's in detail
  Event.mozbrowserclose = ({detail}) =>
    Close();

  Event.mozbrowseropenwindow = ({detail}) =>
    Force.Action({
      action: Open({
        uri: detail.url,
        opener: IFrame.Opener(detail.frameElement),
        name: detail.name,
        features: detail.features
      })
    });

  Event.mozbrowseropentab = ({detail}) =>
    Force.Action({
      action: OpenInBackground({
        uri: detail.url,
        opener: IFrame.Opener(detail.frameElement),
      })
    });

  // TODO: Figure out what's in detail
  Event.mozbrowsercontextmenu = ({detail}) =>
    ContextMenu();

  // TODO: Figure out what's in detail
  Event.mozbrowsershowmodalprompt = ({detail}) =>
    ModalPrompt();

  // TODO: Figure out what's in detail
  Event.mozbrowserusernameandpasswordrequired = ({detail}) =>
    Authentificate();

  // TODO: Figure out what's in detail
  Event.mozbrowsererror = ({detail}) =>
    Failure({detail});


  Event.focus = ({id}) =>
    Focusable.Focused({id});

  Event.blur = ({id}) =>
    Focusable.Blured({id});


  Event.mozbrowsergobackchanged = ({detail: value}) =>
    Navigation.CanGoBackChanged({value});

  Event.mozbrowsergoforwardchanged = ({detail: value}) =>
    Navigation.CanGoForwardChanged({value});


  Event.mozbrowserloadstart = ({target, timeStamp}) =>
    Progress.LoadStarted({uri: target.dataset.uri, timeStamp});

  Event.mozbrowserloadend = ({target, timeStamp}) =>
    Progress.LoadEnded({uri: target.dataset.uri, timeStamp});

  Event.mozbrowsertitlechange = ({target, detail: title}) =>
    Page.TitleChanged({uri: target.dataset.uri, title});

  Event.mozbrowsericonchange = ({target, detail: icon}) =>
    Page.IconChanged({uri: target.dataset.uri, icon});

  Event.mozbrowsermetachange = ({detail: {content, name}}) =>
    Page.MetaChanged({content, name});

  // TODO: Figure out what's in detail
  Event.mozbrowserasyncscroll = ({detail}) =>
    Page.Scrolled();

  Event.mozbrowserscrollareachanged = ({target, detail}) =>
    Page.OverflowChanged({
      overflow: detail.height > target.parentNode.clientHeight
    });

  Event.mozbrowsersecuritychange = ({detail}) =>
    Security.SecurityChanged({
      state: detail.state,
      extendedValidation: detail.extendedValidation
    });

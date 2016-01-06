/* @noflow */

import {forward, thunk, Effects, Task} from 'reflex';
import * as Input from './input';
import * as Assistant from './assistant';
import * as Sidebar from './sidebar';
import * as Browser from './browser';
import * as WebViews from './web-views';
import * as Overlay from './overlay';
import {merge} from '../common/prelude';
import {cursor} from '../common/cursor';
import * as URI from '../common/url-helper';
import {Style, StyleSheet} from '../common/style';
import * as Animation from '../common/animation';
import {ease, easeOutCubic, float} from 'eased';


export const OverlayClicked = {type: "OverlayClicked"};

export const init/*:type.init*/ = () => {
  const [browser, browserFx] = Browser.init();
  const [sidebar, sidebarFx] = Sidebar.init();
  const [overlay, overlayFx] = Overlay.init(false, false);
  const model = {
    mode: 'create-web-view',
    browser,
    sidebar,
    overlay,
    animation: null,
  };

  return [
    model,
    Effects.batch([
      browserFx,
      Effects.task(Task.succeed(Browser.CreateWebView)),
      overlayFx.map(OverlayAction),
      sidebarFx.map(SidebarAction)
    ])
  ];
};

const SidebarAction = action =>
    action.type === "ActivateTab"
  ? Browser.ActivateWebView(action.id)
  : ({ type: "Sidebar", action });


const OverlayAction = action =>
    action.type === "Click"
  ? OverlayClicked
  : ({type: "Overlay", action});

const InputAction = Browser.InputAction;
const WebViewsAction = Browser.WebViewsAction;

const updateSidebar = cursor({
  get: model => model.sidebar,
  set: (model, sidebar) => merge(model, {sidebar}),
  tag: SidebarAction,
  update: Sidebar.update
});

const updateOverlay = cursor({
  get: model => model.overlay,
  set: (model, overlay) => merge(model, {overlay}),
  tag: OverlayAction,
  update: Overlay.update
});

const isWindowFocus = action =>
  action.type === "Shell" &&
  action.action.type === "Focus";

const isOverlayClick = action =>
  action === OverlayClicked;

const isInputAction = action =>
  action.type === 'For' &&
  action.target === 'input';

const isWebViewAction = action =>
  action.type === 'For' &&
  action.target === 'webViews' &&
  (
    action.action.type === 'WebViews.ByActive' ||
    action.action.type === 'WebViews.ByID'
  );

const isFocusAction = action =>
  action.type === 'Focusable.Focus' ||
  action.type === 'Focusable.RequestFocus';

const isAbort = action =>
  action.type === 'ExitInput';

const isSubmit = action =>
  action.type === 'SubmitInput';

const isFocusInput = action =>
  isInputAction(action) &&
  isFocusAction(action.action);

const isKeyDown = action =>
  action.type === 'For' &&
  action.target === 'Browser.KeyDown';

const isKeyUp = action =>
  action.type === 'For' &&
  action.target === 'Browser.KeyUp';

const isCreateTab = action =>
  action.type === 'CreateWebView';

const isShowTabs = action =>
  action.type === 'ShowTabs';

const isEscape = action =>
  action.type === 'Escape';

const isActivateSelected = action =>
  action.type === 'For' &&
  action.target === 'webViews' &&
  action.action.type === 'WebViews.ActivateSelected';

const isActivateSelectedWebView = action =>
  isActivateSelected(action) ||
  (isKeyUp(action) && isActivateSelected(action.action));


const isFocusWebView = action =>
  isWebViewAction(action) &&
  isFocusAction(action.action.action);

const isActivateWebView = action =>
  isWebViewAction(action) &&
  action.action.action.type === 'WebView.Activate';

const isEditWebview = action =>
  action.type === 'EditWebView';

const isSelectRelativeWebView = action =>
  action.type === 'For' &&
  action.target === 'webViews' &&
  action.action.type === 'WebViews.SelectRelative';

const isSwitchSelectedWebView = action =>
  isSelectRelativeWebView(action) ||
  (isKeyDown(action) && isSelectRelativeWebView(action.action));


const AnimationAction = action =>
  ({type: "Animation", action});

export const showTabsTransitionDuration = 600;
export const hideTabsTransitionDuration = 200;


export const update = (model, action) => {
  if (action.type === "Sidebar") {
    return updateSidebar(model, action.action);
  }
  else if (action.type === "Overlay") {
    return updateOverlay(model, action.action);
  }
  else if (action.type === 'Animation') {
    // @TODO Right now we set animation to null whet it is not running but
    // that makes delegation to Animation.update little tricky since animation
    // can be null. Furthermore `Animation.update` itself does not handle
    // `Animation.End` action so we need to check incoming actions before
    // delegation. We should out better API for `Animation` module or stop
    // settings `animation` to `null`.
    if (action.action.type === 'Tick') {
      const [animation, fx] = Animation.update(model.animation, action.action);
      return [
        merge(model, {
          animation:
            ( animation.now <= animation.end
            ? animation
            : null
            )
        }),
        fx.map(AnimationAction)
      ];
    }
    else {
      return [model, Effects.none];
    }
  }
  else if (model.mode === 'create-web-view') {
    if (isAbort(action) || isEscape(action)) {
      // Only switch to show-web-view mode if there is a web view
      // to show. Otherwise remain in 'create-web-view' just let the
      // escape key clear the input or whatever it is that it is supposed
      // to do.
      if (model.browser.webViews.order.length > 0) {
        const [browser, fx] = Browser.update(model.browser, Browser.ShowWebView);
        const [overlay, overlayFx] = Overlay.update(model.overlay, Overlay.Hide);
        return [
          merge(model, {browser, overlay, mode: 'show-web-view'}),
          Effects.batch([
            fx,
            overlayFx.map(OverlayAction)
          ])
        ];
      } else {
        return [model, Effects.none];
      }
    }
    else if (isSubmit(action)) {
      const [browser, fx] = Browser.update(model.browser, Browser.OpenWebView);
      const [overlay, overlayFx] = Overlay.update(model.overlay, Overlay.Hide);
      return [
        merge(model, {browser, overlay, mode: 'show-web-view'}),
        Effects.batch([
          fx,
          overlayFx.map(OverlayAction)
        ])
      ];
    }
    // When window get's focus back return focus to the input field.
    else if (isWindowFocus(action)) {
      const [browser, fx] =
        Browser.update(model.browser, action);

      return [ merge(model, {browser}), Effects.receive(Browser.CreateWebView) ];
    }
    // @TODO: Probably we should prevent input field from loosing a focus
    // by sendig in FocusRequest on Blur. Also we may want to ignore tab
    // switching events in this mode or respond by switching to
    // `select-web-view`.
  }
  else if (model.mode === 'edit-web-view') {
    if (isAbort(action) || isEscape(action) || isOverlayClick(action)) {
      const [browser, fx] = Browser.update(model.browser, Browser.ShowWebView);
      const [overlay, overlayFx] = Overlay.update(model.overlay, Overlay.Hide);

      return [
        merge(model, {browser, overlay, mode: 'show-web-view'}),
        Effects.batch([
          fx,
          overlayFx.map(OverlayAction)
        ])
      ];
    }
    else if (isSubmit(action)) {
      const [browser, fx] = Browser.update(model.browser, Browser.SubmitInput);
      const [overlay, overlayFx] = Overlay.update(model.overlay, Overlay.Hide);

      return [
        merge(model, {browser, overlay, mode: 'show-web-view'}),
        Effects.batch([
          fx,
          overlayFx.map(OverlayAction)
        ])
      ];
    }
    else if (isCreateTab(action)) {
      const [browser, fx] = Browser.update(model.browser, Browser.CreateWebView);
      const [overlay, overlayFx] = Overlay.update(model.overlay, Overlay.Hide);
      return [
        merge(model, {browser, overlay, mode: 'create-web-view'}),
        Effects.batch([
          fx,
          overlayFx.map(OverlayAction)
        ])
      ];
    }
  }
  else if (model.mode === 'show-web-view') {
    if (isFocusInput(action)) {
      const [browser, fx] = Browser.update(model.browser, action);
      const [overlay, overlayFx] = Overlay.update(model.overlay, Overlay.Show);

      return [
        merge(model, {browser, overlay, mode: 'edit-web-view'}),
        Effects.batch([
          fx,
          overlayFx.map(OverlayAction)
        ])
      ]
    }
    else if (isCreateTab(action)) {
      const [browser, fx] = Browser.update(model.browser, Browser.CreateWebView);
      const [overlay, overlayFx] = Overlay.update(model.overlay, Overlay.Hide);
      return [
        merge(model, {browser, mode: 'create-web-view'}),
        fx
      ];
    }
    // @TODO we should also wire up esc to cancel current webview loading if
    // 1) webview is loading 2) current mode is show webview.
    // When current webview is loading, esc should cancel load. Hitting esc
    // again should transition to show-tabs view.
    // When current webview is not loading, esc should go direct to
    // show-tabs view.
    else if (isShowTabs(action) || isEscape(action)) {
      const [browser, fx] = Browser.update(model.browser, Browser.ShowTabs);
      const [overlay, overlayFx] = Overlay.update(model.overlay, Overlay.Fade);
      const [sidebar, sidebarFx] = Sidebar.update(model.sidebar, Sidebar.Open);
      const [animation, animationFx]
        = Animation.init(performance.now(), showTabsTransitionDuration);

      return [
        merge(model, {browser, overlay, sidebar, animation, mode: 'show-tabs'}),
        Effects.batch([
          fx,
          sidebarFx.map(SidebarAction),
          animationFx.map(AnimationAction),
          overlayFx.map(OverlayAction)
        ])
      ];
    }
    else if (isSwitchSelectedWebView(action)) {
      const time = performance.now();
      const [browser, fx] = Browser.update(model.browser, action);
      const [overlay, overlayFx] = Overlay.update(model.overlay, Overlay.Fade);
      const [sidebar, sidebarFx] = Sidebar.update(model.sidebar, Sidebar.Open);
      const [animation, animationFx]
        = Animation.init(time, showTabsTransitionDuration);

      return [
        merge(model, {browser, sidebar, overlay, animation, mode: 'select-web-view'}),
        Effects.batch([
          fx,
          overlayFx.map(OverlayAction),
          sidebarFx.map(SidebarAction),
          // If animation was running no need for another tick.
          model.animation ? Effects.none : animationFx.map(AnimationAction)
        ])
      ];
    }
    else if (isEditWebview(action)) {
      const [browser, fx] = Browser.update(model.browser, action);
      const [overlay, overlayFx] = Overlay.update(model.overlay, Overlay.Show);

      return [
        merge(model, {browser, overlay, mode: 'edit-web-view'}),
        Effects.batch([
          fx,
          overlayFx.map(OverlayAction)
        ])
      ];
    }
  }
  else if (model.mode === 'show-tabs') {
    if (isEscape(action) ||
        isFocusWebView(action) ||
        isActivateWebView(action) ||
        isOverlayClick(action))
    {
      const time = performance.now();
      const [browser, fx] = Browser.update(model.browser, Browser.ShowWebView);
      const [overlay, overlayFx] = Overlay.update(model.overlay, Overlay.Hide);
      const [sidebar, sidebarFx] = Sidebar.update(model.sidebar, Sidebar.Close);
      // TODO: Handle already running animation case (see #747).
      const [animation, animationFx]
        = Animation.init(time, hideTabsTransitionDuration);

      return [
        merge(model, {browser, sidebar, overlay, animation, mode: 'show-web-view'}),
        Effects.batch([
          fx,
          sidebarFx.map(SidebarAction),
          overlayFx.map(OverlayAction),
          // If animation was running no need for another tick.
          ( model.animation
          ? Effects.none
          : animationFx.map(AnimationAction)
          )
        ])
      ];
    }
    else if (isCreateTab(action)) {
      const [browser, fx] = Browser.update(model.browser, action);
      const [overlay, overlayFx] = Overlay.update(model.overlay, Overlay.Hide);
      const [sidebar, sidebarFx] = Sidebar.update(model.sidebar, Sidebar.Close);
      return [
        merge(model, {browser, sidebar, overlay, mode: 'create-web-view'}),
        Effects.batch([
          fx,
          sidebarFx.map(SidebarAction),
          overlayFx.map(OverlayAction)
        ])
      ];
    }
    // @TODO: Find out if we should handle this as it's not in the control
    // flow diagram, but presumably `meta l` should still trigger this.
    else if (isFocusInput(action)) {
      const [browser, fx] = Browser.update(model.browser, action);
      const [overlay, overlayFx] = Overlay.update(model.overlay, Overlay.Show);
      const [sidebar, sidebarFx] = Sidebar.update(model.sidebar, Sidebar.Close);
      return [
        merge(model, {browser, overlay, mode: 'edit-web-view'}),
        Effects.batch([
          fx,
          overlayFx.map(OverlayAction),
          sidebarFx.map(SidebarAction),
          // If animation was running no need for another tick.
          model.animation ? Effects.none : animationFx.map(AnimationAction)
        ])
      ];
    }
  }
  else if (model.mode === 'select-web-view') {
    if (isActivateSelectedWebView(action)) {
      const time = performance.now();
      const [browser, fx] = Browser.update(model.browser, action);
      const [overlay, overlayFx] = Overlay.update(model.overlay, Overlay.Hide);
      const [sidebar, sidebarFx] = Sidebar.update(model.sidebar, Sidebar.Close);
      const [animation, animationFx]
        = Animation.init(time, hideTabsTransitionDuration);

      return [
        merge(model, {browser, sidebar, overlay, animation, mode: 'show-web-view'}),
        Effects.batch([
          fx,
          overlayFx.map(OverlayAction),
          sidebarFx.map(SidebarAction),
          // If animation was running no need for another tick.
          model.animation ? Effects.none : animationFx.map(AnimationAction)
        ])
      ];
    }
  }

  // If we reached this then action
  const [browser, fx] = Browser.update(model.browser, action);
  return [merge(model, {browser}), fx];
}

const zoom = (from, to, progress) => merge(from, {
  angle: float(from.angle, to.angle, progress),
  depth: float(from.depth, to.depth, progress)
})

const flipSlide = (from, to, progress) => merge(from, {
  angle: float(from.angle, to.angle, progress),
  x: float(from.x, to.x, progress)
});

const transition = {
  webViewZoomOut(model) {
    const {angle, depth}
      = model == null ?
          {angle: 10, depth: -600} :
          ease(easeOutCubic,
                zoom,
                {angle: 0, depth: 0},
                {angle: 10, depth: -600},
                Animation.duration(model),
                Animation.progress(model));
    return {
      transform: `translate3d(0, 0, ${depth}px) rotateY(${angle}deg)`
    }
  },
  webViewZoomIn(model) {
    const {angle, depth}
      = model == null ?
          {angle: 0, depth: 0} :
          ease(easeOutCubic,
                zoom,
                {angle: 10, depth: -600},
                {angle: 0, depth: 0},
                Animation.duration(model),
                Animation.progress(model));
    return {
      transform: `translate3d(0, 0, ${depth}px) rotateY(${angle}deg)`
    }
  }
}

const style = StyleSheet.create({
  webViewZoomedIn: {},
  webViewZoomedOut: {
    transform: 'translate3d(0, 0, -600px) rotateY(10deg)',
    transformOrigin: 'left center',
    pointerEvents: 'none'
  },

  webViewShrink: {
    width: 'calc(100% - 50px)'
  },

  webViewExpand: {

  },

  assistantHidden: {
    display: 'none'
  },

  assistantFull: {
    // @WORKAROUND use percent instead of vw/vh to work around
    // https://github.com/servo/servo/issues/8754
    height: '100%'
  }
});

export const view/*:type.view*/ = (model, address) =>
  model.mode === 'edit-web-view' ?
    viewAsEditWebView(model, address) :
  model.mode === 'show-web-view' ?
    viewAsShowWebView(model, address) :
  model.mode === 'create-web-view' ?
    viewAsCreateWebView(model, address) :
  model.mode === 'select-web-view' ?
    viewAsSelectWebView(model, address) :
  // mode === 'show-tabs' ?
    viewAsShowTabs(model, address);

const viewAsEditWebView = (model, address) =>
  Browser.view(model.browser, address, [
    thunk('web-views',
          WebViews.view,
          model.browser.webViews,
          forward(address, WebViewsAction),
          Style(  model.sidebar.isAttached
                ? style.webViewShrink
                : style.webViewExpand,
                  style.webViewZoomedIn)),
    thunk('overlay',
          Overlay.view,
          model.overlay,
          forward(address, OverlayAction)),
    thunk('sidebar',
          Sidebar.view,
          model.sidebar,
          model.browser.webViews,
          forward(address, SidebarAction)),
    thunk('suggestions',
          Assistant.view,
          model.browser.suggestions,
          address),
    thunk('input',
          Input.view,
          model.browser.input,
          forward(address, InputAction),
          style.inputVisible)
  ]);

const viewAsShowWebView = (model, address) =>
  Browser.view(model.browser, address, [
    thunk('web-views',
          WebViews.view,
          model.browser.webViews,
          forward(address, WebViewsAction),
          Style(  model.sidebar.isAttached
                ? style.webViewShrink
                : style.webViewExpand,
                transition.webViewZoomIn(model.animation))),
    thunk('overlay',
          Overlay.view,
          model.overlay,
          forward(address, OverlayAction)),
    thunk('sidebar',
          Sidebar.view,
          model.sidebar,
          model.browser.webViews,
          forward(address, SidebarAction)),
    thunk('suggestions',
          Assistant.view,
          model.browser.suggestions,
          address,
          style.assistantHidden),
    thunk('input',
          Input.view,
          model.browser.input,
          forward(address, InputAction))
  ]);

const viewAsCreateWebView = (model, address) =>
  Browser.view(model.browser, address, [
    thunk('web-views',
          WebViews.view,
          model.browser.webViews,
          forward(address, WebViewsAction),
          Style(style.webViewZoomedOut,
                  model.sidebar.isAttached
                ? style.webViewShrink
                : style.webViewExpand,
                transition.webViewZoomIn(model.animation))),
    thunk('overlay',
          Overlay.view,
          model.overlay,
          forward(address, OverlayAction)),
    thunk('sidebar',
          Sidebar.view,
          model.sidebar,
          model.browser.webViews,
          forward(address, SidebarAction)),
    thunk('suggestions',
          Assistant.view,
          model.browser.suggestions,
          address,
          style.assistantFull),
    thunk('input',
          Input.view,
          model.browser.input,
          forward(address, InputAction))
  ]);

const viewAsSelectWebView = (model, address) =>
  Browser.view(model.browser, address, [
    thunk('web-views',
          WebViews.view,
          model.browser.webViews,
          forward(address, WebViewsAction),
          Style(style.webViewZoomedOut,
                  model.sidebar.isAttached
                ? style.webViewShrink
                : style.webViewExpand,
                transition.webViewZoomOut(model.animation))),
    thunk('overlay',
          Overlay.view,
          model.overlay,
          forward(address, OverlayAction)),
    thunk('sidebar',
          Sidebar.view,
          model.sidebar,
          model.browser.webViews,
          forward(address, SidebarAction)),
    thunk('suggestions',
          Assistant.view,
          model.browser.suggestions,
          address,
          style.assistantHidden),
    thunk('input',
          Input.view,
          model.browser.input,
          forward(address, InputAction))
  ]);

const viewAsShowTabs = (model, address) =>
  Browser.view(model.browser, address, [
    thunk('web-views',
          WebViews.view,
          model.browser.webViews,
          forward(address, WebViewsAction),
          Style(style.webViewZoomedOut,
                ( model.sidebar.isAttached
                ? style.webViewShrink
                : style.webViewExpand
                ),
                transition.webViewZoomOut(model.animation))),
    thunk('overlay',
          Overlay.view,
          model.overlay,
          forward(address, OverlayAction)),
    thunk('sidebar',
          Sidebar.view,
          model.sidebar,
          model.browser.webViews,
          forward(address, SidebarAction)),
    thunk('suggestions',
          Assistant.view,
          model.browser.suggestions,
          address,
          style.assistantHidden),
    thunk('input',
          Input.view,
          model.browser.input,
          forward(address, InputAction))
  ]);

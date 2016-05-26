/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


import * as Package from "../package.json";
import * as Config from "../browserhtml.json";
import {Effects, html, forward, thunk} from "reflex";

import * as Shell from "./browser/shell";
import * as WebViews from "./browser/web-views";
import * as Sidebar from './browser/Sidebar';

import * as Devtools from "./common/devtools";
import * as Runtime from "./common/runtime";
import * as URL from './common/url-helper';
import * as Unknown from "./common/unknown";
import * as Focusable from "./common/focusable";
import * as OS from './common/os';
import * as Keyboard from './common/keyboard';
import * as Stopwatch from "./common/stopwatch";
import * as Easing from "eased";
import {merge, always, batch, tag, tagged} from "./common/prelude";
import {cursor} from "./common/cursor";
import {Style, StyleSheet} from './common/style';

import {identity, compose} from "./lang/functional";

import {onWindow} from "@driver";

/*::
import type {Address, DOM} from "reflex"
import type {URI} from "./common/prelude"
import type {Model, Action} from "./browser"
*/

export const init = ()/*:[Model, Effects<Action>]*/ => {
  const [devtools, devtoolsFx] = Devtools.init({isActive: Config.devtools});
  const [shell, shellFx] = Shell.init();
  const [webViews, webViewsFx] = WebViews.init();
  const [sidebar, sidebarFx] = Sidebar.init();

  const model =
    { version
    , shell
    , webViews
    , sidebar
    , devtools
    };

  const fx =
    Effects.batch
    ( [ devtoolsFx.map(DevtoolsAction)
      , shellFx.map(ShellAction)
      , webViewsFx.map(WebViewsAction)
      , sidebarFx.map(SidebarAction)
      , Effects.receive(CreateWebView)
      , Effects
        .perform(Runtime.receive('mozbrowseropenwindow'))
        .map(OpenURL)
      ]
    );

  return [model, fx];
}

const NoOp = always({ type: "NoOp" });

const SidebarAction = action =>
  ( action.type === "CreateWebView"
  ? CreateWebView
  : action.type === "ActivateTab"
  ? ActivateWebViewByID(action.id)
  : action.type === "CloseTab"
  ? CloseWebViewByID(action.id)
  : action.type === "Tabs"
  ? WebViewActionByID(action.source.id, action.source)
  : action.type === "Attach"
  ? AttachSidebar
  : action.type === "Detach"
  ? DetachSidebar
  : { type: "Sidebar"
    , action
    }
  );


    }
  );

const WebViewsAction = (action/*:WebViews.Action*/)/*:Action*/ =>
  ( action.type === "ShowTabs"
  ? ShowTabs
  : action.type === "Create"
  ? CreateWebView
  : action.type === "Edit"
  ? EditWebView
  : action.type === "SelectRelative"
  ? { type: "SelectTab"
    , source: action
    }
    // Note: Flow type checker has some bug releated to union types where
    // use of the same properties across union types seem to confuse it.
    // avoiding same shapes (and calling source differently on each type)
    // seems to resolve the problem.
  : action.type === "ActivateSelected"
  ? { type: "ActivateTab"
    , activateTab: action
    }
  : action.type === "ActivateByID"
  ? { type: "ActivateTabByID"
    , activateTabByID: action
    }
  : { type: 'WebViews'
    , source: action
    }
  );

const ShellAction = action =>
  ( action.type === 'Focus'
  ? { type: 'Focus'
    , source: action
    }
  : { type: 'Shell'
    , source: action
    }
  );

const DevtoolsAction = action =>
  ( { type: 'Devtools'
    , action
    }
  );


const updateWebViews = cursor({
  get: model => model.webViews,
  set: (model, webViews) => merge(model, {webViews}),
  update: WebViews.update,
  tag: WebViewsAction
});

const updateShell = cursor({
  get: model => model.shell,
  set: (model, shell) => merge(model, {shell}),
  update: Shell.update,
  tag: ShellAction
});

const updateDevtools = cursor({
  get: model => model.devtools,
  set: (model, devtools) => merge(model, {devtools}),
  update: Devtools.update,
  tag: DevtoolsAction
});

const updateSidebar = cursor({
  get: model => model.sidebar,
  set: (model, sidebar) => merge(model, {sidebar}),
  tag: SidebarAction,
  update: Sidebar.update
});

const Reloaded/*:Action*/ =
  { type: "Reloaded"
  };

const Failure = error =>
  ( { type: "Failure"
    , error: error
    }
  );


// ### Mode changes


export const CreateWebView/*:Action*/ =
  { type: 'CreateWebView'
  };

export const EditWebView/*:Action*/ =
  { type: 'EditWebView'
  };

export const ShowWebView/*:Action*/ =
  { type: 'ShowWebView'
  };

export const ShowTabs/*:Action*/ =
  { type: 'ShowTabs'
  };

export const SelectWebView/*:Action*/ =
  { type: 'SelectWebView'
  };

// ### Actions that affect multilpe sub-components

export const OpenWebView/*:Action*/ =
  { type: 'OpenWebView'
  };

export const AttachSidebar/*:Action*/ =
  { type: "AttachSidebar"
  , source: Sidebar.Attach
  };

export const DetachSidebar/*:Action*/ =
  { type: "DetachSidebar"
  , source: Sidebar.Detach
  };

export const Escape/*:Action*/ =
  { type: 'Escape'
  };


export const Unload/*:Action*/ =
  { type: 'Unload'
  };

export const ReloadRuntime/*:Action*/ =
  { type: 'ReloadRuntime'
  };

export const BlurInput/*:Action*/ =
  { type: 'BlurInput'
  };


// Following Browser actions directly delegate to a `WebViews` module, there for
// they are just tagged versions of `WebViews` actions, but that is Just an
// implementation detail.
export const ZoomIn = WebViewsAction(WebViews.ZoomIn);
export const ZoomOut = WebViewsAction(WebViews.ZoomOut);
export const ResetZoom = WebViewsAction(WebViews.ResetZoom);
export const Reload = WebViewsAction(WebViews.Reload);
export const CloseWebView = WebViewsAction(WebViews.CloseActive);
export const GoBack = WebViewsAction(WebViews.GoBack);
export const GoForward = WebViewsAction(WebViews.GoForward);
export const SelectNext = WebViewsAction(WebViews.SelectNext);
export const SelectPrevious = WebViewsAction(WebViews.SelectPrevious);
export const ActivateSeleted = WebViewsAction(WebViews.ActivateSelected);
export const FocusWebView = WebViewsAction(WebViews.Focus);
export const NavigateTo = compose(WebViewsAction, WebViews.NavigateTo);
const UnfoldWebViews = WebViewsAction(WebViews.Unfold);
const FoldWebViews = WebViewsAction(WebViews.Fold);
const Open = compose(WebViewsAction, WebViews.Open);
const ReceiveOpenURLNotification =
  { type: "ReceiveOpenURLNotification"
  };

const OpenURL = ({url}) =>
  ( { type: "OpenURL"
    , uri: url
    }
  );

export const ActivateWebViewByID =
  compose(WebViewsAction, WebViews.ActivateByID);
const WebViewActionByID =
  compose(WebViewsAction, WebViews.ActionByID);

const CloseWebViewByID =
  compose(WebViewsAction, WebViews.CloseByID);

// Following browser actions directly delegate to one of the existing modules
// there for we define them by just wrapping actions from that module to avoid
// additional wiring (which is implementation detail that may change).
export const ToggleDevtools = DevtoolsAction(Devtools.Toggle);
const PrintSnapshot = { type: "PrintSnapshot" };
const PublishSnapshot = { type: "PublishSnapshot" };
export const Blur = ShellAction(Shell.Blur);
export const Focus = ShellAction(Shell.Focus);
const ExpandSidebar = SidebarAction(Sidebar.Expand);
const CollapseSidebar = SidebarAction(Sidebar.Collapse);


const DockSidebar =
  { type: "Sidebar"
  , action: Sidebar.Attach
  };

const UndockSidebar =
  { type: "Sidebar"
  , action: Sidebar.Detach
  };

export const LiveReload =
  { type: 'LiveReload'
  };

const modifier = OS.platform() == 'linux' ? 'alt' : 'accel';
const decodeKeyDown = Keyboard.bindings({
  'accel l': always(EditWebView),
  'accel t': always(CreateWebView),
  'accel 0': always(ResetZoom),
  'accel -': always(ZoomOut),
  'accel =': always(ZoomIn),
  'accel shift =': always(ZoomIn),
  'accel w': always(CloseWebView),
  'accel shift ]': always(SelectNext),
  'accel shift [': always(SelectPrevious),
  'control tab': always(SelectNext),
  'control shift tab': always(SelectPrevious),
  // 'accel shift backspace':  always(ResetBrowserSession),
  // 'accel shift s': always(SaveBrowserSession),
  'accel r': always(Reload),
  'escape': always(Escape),
  [`${modifier} left`]: always(GoBack),
  [`${modifier} right`]: always(GoForward),

  // TODO: `meta alt i` generates `accel alt i` on OSX we need to look
  // more closely into this but so declaring both shortcuts should do it.
  'accel alt i': always(ToggleDevtools),
  'accel alt ˆ': always(ToggleDevtools),
  'F12': always(ToggleDevtools),
  'F5': always(ReloadRuntime),
  'meta control r': always(ReloadRuntime),
  'meta alt 3': always(PrintSnapshot),
  'meta alt 4': always(PublishSnapshot)
});

const decodeKeyUp = Keyboard.bindings({
  'control': always(ActivateSeleted),
  'accel': always(ActivateSeleted)
});

const showWebView = model =>
  batch
  ( update
  , merge(model, {mode: 'show-web-view'})
  , [ HideInput
    , CloseAssistant
    , CloseSidebar
    , HideOverlay
    , FoldWebViews
    , FocusWebView
    ]
  );

const createWebView = model =>
  batch
  ( update
  , merge(model, {mode: 'create-web-view'})
  , [ ShowInput
    , ExpandAssistant
    , CloseSidebar
    , HideOverlay
    , FoldWebViews
    , EnterInput
    ]
  );

const editWebView = model =>
  batch
  ( update
  , merge(model, {mode: 'edit-web-view'})
  , [ ShowInput
    , OpenAssistant
    , CloseSidebar
    , ShowOverlay
    , FoldWebViews
    , EnterInputSelection(WebViews.getActiveURI(model.webViews, ''))
    ]
  );

const showTabs = model =>
  batch
  ( update
  , merge(model, {mode: 'show-tabs'})
  , [ HideInput
    , CloseAssistant
    , OpenSidebar
    , ShowOverlay
    , UnfoldWebViews
    ]
  );


const selectWebView = (model, action) =>
  batch
  ( update
  , merge(model, {mode: 'select-web-view'})
  , [ HideInput
    , CloseAssistant
    , OpenSidebar
    , UnfoldWebViews
    , FadeOverlay
    ]
  );



const openWebView = model =>
  update
  ( model
  , Open
    ( { uri: URL.read(model.input.value)
      , disposition: 'default'
      , name: ''
      , features: ''
      , ref: null
      , guestInstanceId: null
      }
    )
  );

const openURL = (model, uri) =>
  batch
  ( update
  , model
  , [ Open
      ( { uri
        , disposition: 'default'
        , name: ''
        , features: ''
        , ref: null
        , guestInstanceId: null
        }
      )
    , ShowWebView
    , ReceiveOpenURLNotification
    ]
  );

const reciveOpenURLNotification = model =>
  [ model
  , Effects
    .perform(Runtime.receive('mozbrowseropenwindow'))
    .map(OpenURL)
  ];


const focusWebView = model =>
  update(model, FocusWebView)

const exitInput = model =>
  batch
  ( update
  , model
  , [ CloseAssistant
    , FocusWebView
    ]
  );


const attachSidebar = model =>
  batch
  ( update
  , merge(model, {mode: 'show-web-view'})
  , [ DockSidebar
    , Shrink
    , CloseSidebar
    , HideOverlay
    , FoldWebViews
    , FocusWebView
    ]
  );

const detachSidebar = model =>
  batch
  ( update
  , model
  , [ UndockSidebar
    , Expand
    ]
  );

const reloadRuntime = model =>
  [ model
  , Effects
    .perform(Runtime.reload)
    .map(always(Reloaded))
  ];




export const update =
  (model/*:Model*/, action/*:Action*/)/*:[Model, Effects<Action>]*/ => {
    console.log(JSON.stringify(action))
    switch (action.type) {
      case 'GoBack':
        return goBack(model);
      case 'GoForward':
        return goForward(model);
      case 'Reload':
        return reload(model);
      case 'ZoomIn':
        return zoomIn(model);
      case 'ZoomOut':
        return zoomOut(model);
      case 'ResetZoom':
        return resetZoom(model);
      case 'Close':
        return close(model);
      case 'OpenNewTab':
        return openNewTab(model);
      case 'EditWebView':
        return editWebView(model);
      case 'ShowWebView':
        return showWebView(model);
      case 'ShowTabs':
        return showTabs(model);
      case 'Escape':
        return toggleTabs(model);
      case 'AttachSidebar':
        return attachSidebar(model);
      case 'DetachSidebar':
        return detachSidebar(model);
      case 'ReloadRuntime':
        return reloadRuntime(model);
      case 'SelectNext':
        return selectNext(model);
      case 'SelectPrevious':
        return selectPrevious(model);
      case 'EndSelection':
        return endSelection(model);
      case 'Shell':
        return updateShell(model, action.source);
      case 'Focus':
        return updateShell(model, Shell.Focus);
      case 'Devtools':
        return updateDevtools(model, action.action);
      case 'Sidebar':
        return updateSidebar(model, action.action);
      case 'Tabs':
        return updateNavigators(model, action);
      case 'Navigators':
        return updateNavigators(model, action.navigators);
      case 'Failure':
        return [
           model
        , Effects
          .perform(Unknown.error(action.error))
          .map(NoOp)
        ];

      // Ignore some actions.
      case 'Reloaded':
        return [ model, Effects.none ]
      case 'PrintSnapshot':
        return [model, Effects.none];
      case 'UploadSnapshot':
        return [model, Effects.none];
      // TODO: Delegate to modules that need to do cleanup.
      case 'LiveReload':
        return [model, Effects.none];

      default:
        return Unknown.update(model, action);
    }
  };

const styleSheet = StyleSheet.create({
  root: {
    background: '#171814',
    perspective: '1000px',
    // These styles prevent scrolling with the arrow keys in the root window
    // when elements move outside of viewport.
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    position: 'absolute',
    MozWindowDragging: 'drag',
    WebkitAppRegion: 'drag'
  },
  content: {
    position: 'absolute',
    perspective: '1000px',
    height: '100vh',
    width: '100vw'
  }
});

export const view =
  (model/*:Model*/, address/*:Address<Action>*/)/*:DOM*/ =>
  html.main
  ( { className: 'root'
    , style: styleSheet.root
    , tabIndex: 1
    , onKeyDown: onWindow(address, decodeKeyDown)
    , onKeyUp: onWindow(address, decodeKeyUp)
    , onBlur: onWindow(address, always(Blur))
    , onFocus: onWindow(address, always(Focus))
    , onUnload: onWindow(address, always(Unload))
    }
  , [ Webviews.view
      ( model.navigators
      , forward(address, NavigatorsAction)
      )

    , Sidebar.view
      ( model.sidebar
      , model.navigators.deck
      , forward(address, SidebarAction)
      )

    , Shell.view
      ( model.shell
      , forward(address, ShellAction)
      )

    , Devtools.view
      ( model.devtools
      , forward(address, DevtoolsAction)
      )
    ]
  );

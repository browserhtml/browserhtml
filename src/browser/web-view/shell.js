/* @noflow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*:: import * as type from "../../../type/browser/web-view/shell" */

import {Effects, Task} from "reflex";
import {merge} from "../../common/prelude";
import * as Focusable from "../../common/focusable";
import * as Result from "../../common/result";

export const MakeVisibile =
  ({type: "MakeVisibile"});

export const MakeNotVisible =
  ({type: "MakeNotVisible"});

export const ZoomIn/*:type.ZoomIn*/ =
  ({type: "ZoomIn"});

export const ZoomOut/*:type.ZoomOut*/ =
  ({type: "ZoomOut"});

export const ResetZoom/*:type.ResetZoom*/ =
  ({type: "ResetZoom"});

const FocusableAction = action =>
  ({type: "Focusable", action});

export const Focus = FocusableAction(Focusable.Focus);
export const Blur = FocusableAction(Focusable.Blur);


export const VisibilityChanged/*:type.VisibilityChanged*/ = result =>
  ({type: "VisibilityChanged", result});

export const ZoomChanged/*:type.ZoomChanged*/ = result =>
  ({type: "ZoomChanged", result});

const setZoom = (id, level) =>
  Task.future(() => {
    const target = document.getElementById(`web-view-${id}`);
    const result
      = target == null
      ? Result.error(`WebView with id web-view-${id} not found`)
      : typeof(target.zoom) !== 'function'
      ? Result.error(`.zoom is not supported by runtime`)
      : Result.ok(level);

    if (result.isOk) {
      // @FlowIssue: Flow can't infer enough to tell it's function here.
      target.zoom(level)
    }

    return Promise.resolve(result)
  });

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;

export const zoomIn/*:type.zoomIn*/ = (id, zoom) =>
  setZoom(id, Math.min(ZOOM_MAX, zoom + ZOOM_STEP));

export const zoomOut/*:type.zoomOut*/ = (id, zoom) =>
  setZoom(id, Math.max(ZOOM_MIN, zoom - ZOOM_STEP));

export const resetZoom/*:type.resetZoom*/ = id =>
  setZoom(id, 1);

export const setVisibility/*:type.setVisibility*/ = (id, isVisible) =>
  Task.future(() => {
    const target = document.getElementById(`web-view-${id}`);
    const result
      = target == null
      ? Result.error(`WebView with id web-view-${id} not found`)
      : typeof(target.setVisible) !== 'function'
      ? Result.error(`.setVisible is not supported by runtime`)
      : Result.ok(isVisible);

    if (result.isOk) {
      // @FlowIssue: Flow can't infer enough to tell it's function here.
      target.setVisible(isVisible);
    }

    return Promise.resolve(result);
  });

// Reports error as a warning in a console.
const report =
  error =>
  new Task((succeed, fail) => {
    console.warn(error);
  });


export const init/*:type.init*/ = (id, isFocused) =>
  [ {id, isFocused: isFocused, isVisible: false, zoom: 1}
  , ( isFocused
    ? Effects.receive(Focus)
    : Effects.none
    )
  ];

export const update/*:type.update*/ = (model, action) =>
  ( action.type === 'ZoomIn'
  ? [ model
    , Effects
        .task(zoomIn(model.id, model.zoom))
        .map(ZoomChanged)
    ]
  : action.type === 'ZoomOut'
  ? [ model
    , Effects
        .task(zoomOut(model.id, model.zoom))
        .map(ZoomChanged)
    ]
  : action.type === 'ResetZoom'
  ? [ model
    , Effects
        .task(resetZoom(model.id))
        .map(ZoomChanged)
    ]
  : action.type === 'MakeVisibile'
  ? [ model
    , Effects
        .task(setVisibility(model.id, true))
        .map(VisibilityChanged)
    ]
  : action.type === 'MakeNotVisible'
  ? [ model
    , Effects
        .task(setVisibility(model.id, false))
        .map(VisibilityChanged)
    ]
  : action.type === 'VisibilityChanged'
  ? ( action.result.isOk
    ? [ merge(model, {isVisible: action.result.value}), Effects.none ]
    : [ model, Effects.task(report(action.result.error)) ]
    )
  : action.type === 'ZoomChanged'
  ?  ( action.result.isOk
    ? [ merge(model, {zoom: action.result.value}), Effects.none ]
    : [ model, Effects.task(report(action.result.error)) ]
    )

  // Delegate
  : action.type === 'Focusable'
  ? Focusable.update(model, action.action)

  : [model, Effects.none]
  );

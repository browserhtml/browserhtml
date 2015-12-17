/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*:: import * as type from "../../type/browser/web-views" */

import {html, thunk, Effects, forward} from "reflex";
import * as Driver from "driver";
import {merge, always} from "../common/prelude";
import {cursor} from "../common/cursor";
import * as WebView from "../browser/web-view";
import * as Unknown from "../common/unknown";
import {Style, StyleSheet} from "../common/style";

export const initial = {
  nextID: 0,
  // @TODO selected field should probably live elsewhere and be maintained
  // by a different component.
  selected: -1,
  active: -1,
  entries: []
};


// Actions

const ByActive = action => {type: "ByActive", action};
const ByID = id => action =>
    action.type === "WebViews.Open!WithMyIFrameAndInTheCurrentTick"
  ? action
  : {type: "ByID", id, action};

export const NavigateTo = uri => ({type: "NavigateTo", uri});

export const SelectRelative = offset =>
  ({type: "SelectRelative", offset});
export const SelectNext = SelectRelative(1);
export const SelectPrevious = SelectRelative(-1);


export const ActivateSelected = {type: "ActivateSelected"};

export const ZoomIn = ByActive(WebView.RequestZoomIn);
export const ZoomOut = ByActive(WebView.RequestZoomOut);
export const ResetZoom = ByActive(WebView.RequestZoomReset);
export const Reload = ByActive(WebView.RequestReload);
export const GoBack = ByActive(WebView.RequestGoBack);
export const GoForward = ByActive(WebView.RequestGoForward);
export const Focus = ByActive(WebView.Focus);
export const Close = ByActive(WebView.Close);

export const Open = ({uri, inBackground, name, features}) => ({
  type: "Open",
  options: {
    uri,
    inBackground: inBackground == null ? false : inBackground,
    name: name == null ? '' : name,
    features: features == null ? '' : features
  }
});



export const indexByID/*:type.indexByID*/ = (model, id) =>
  model.entries.findIndex(entry => entry.id === id);

const open = (model, options) => {
  const next = merge(model, {
    nextID: model.nextID + 1,
    selected: model.selected + 1,
    active: model.active + 1,
    entries: [WebView.open(model.nextID, options), ...model.entries]
  });

  return options.inBackground ?
    [next, Effects.none] :
    [activateByID(next, model.nextID), Effects.none]
};

const navigateTo = (model, uri) => {
  if (model.active < 0) {
    return open(model, {uri, inBackground: false, name: '', features: ''});
  } else {
    return updateByActive(model, WebView.asLoad(uri));
  }
}

export const indexOfOffset/*:type.indexByOffset*/ = (index, size, offset, loop) => {
  const position = index + offset;
  if (size === 0) {
    return - 1
  } else if (loop) {
    const index = position - Math.trunc(position / size) * size
    return index < 0 ? index + size :  index
  } else {
    return Math.min(size - 1, Math.max(0, position))
  }
}

const selectByIndex = (model, index) => {
  // If selection does not change return model back.
  if (index === model.selected) {
    return [model, Effects.none];
  }
  // if selection is out of the bound log warning and return model back.
  else if (index < 0 || index >= model.entries.length) {
    console.warn(`Can not select WebView under ${index} index as it does not exists`, model);
    return [model, Effects.none];
  }
  else {
    const {selected} = model;
    const entries = model.entries.slice(0);

    // Initially there are no web-views and there for none is selected, we need
    // in such case nothing needs to be unselected.
    if (selected >= 0) {
      const [unselect, unselectFx] = WebView.unselect(entries[selected]);
      const [select, selectFx] = WebView.select(entries[index]);
      entries[selected] = unselect
      entries[index] = select

      return [
        merge(model, {selected: index, entries}),
        Effects.batch([
          unselectFx.map(ByID(unselect.id)),
          selectFx.map(ByID(select.id))
        ])
      ]
    }
    else {
      // Mark web-view we intend to select as selected.
      const [select, fx] = WebView.select(entries[index])
      entries[index] = selected
      return [
        merge(model, {selected: index, entries}),
        fx.map(ByID(select.id))
      ];
    }
  }
}

const selectByID = (model, id) =>
  selectByIndex(model, indexByID(model, id));

const selectByOffset = (model, offset) =>
  selectByIndex(model, indexOfOffset(model.selected,
                                      model.entries.length,
                                      offset,
                                      true));

const activateByIndex = (model, index) => {
  if (index === model.active) {
    return model
  }
  else if (index < 0 || index >= model.entries.length) {
    console.warn(`Can not activate WebView under ${index} index as it does not exists`, model);
    return model;
  }
  else {
    const {selected, active} = model;
    const entries = model.entries.slice(0);
    const count = entries.length;

    if (selected >= 0 && selected !== index && selected < count) {
      entries[selected] = merge(entries[selected], {isSelected: false});
    }

    if (active >= 0 && active !== index && active < count) {
      entries[active] = WebView.deactivate(entries[active]);
    }

    entries[index] = WebView.activate(merge(entries[index], {isSelected: true}));

    return merge(model, {selected: index, active: index, entries});
  }
}

const activateSelected = (model) =>
  activateByIndex(model, model.selected);

const activateByID = (model, id) =>
  activateByIndex(model, indexByID(model, id));

const closeByIndex = (model, index) => {
  if (index < 0 || index >= model.entries.length) {
    console.warn(`Can not close WebView for the index: ${index}:`, model);
    return model;
  } else {
    const {selected, active, entries} = model;
    const count = entries.length;

    const nextIndex
        // If index of the view being closed comes after the currently selected
        // view, selection index is not affected.
      = index > selected ?
          selected :
        // If index of the view being closed comes before the curretly selected
        // view, selection index is decremented to point to the new index of
        // the view.
        index < selected ?
          selected - 1 :

        // If we got this far than view being closed is currently selected. This
        // case has it's own branched logic described below.

        // If there was only one view than there is no selected view and index
        // is set to -1.
        count === 1 ?
          -1 :
        // If the view being closed is the first one selection is moved to the
        // following view - first view remains selected.
        selected === 0 ?
          0 :
          // Otherwise selection is kept for the same index although actual view
          // will be different.
          selected - 1;

      return activateByIndex(merge(model, {entries: remove(entries, index)}),
                              nextIndex)
  }
};

const closeActive = model =>
  closeByIndex(model, model.active);

const closeByID = (model, id) =>
  closeByIndex(model, indexByID(model, id))

const updateByActive = (model, action) =>
  action.type === "WebView.Close" ?
    [closeActive(model), Effects.none] :
    updateByIndex(model, model.active, action);

const updateByID = (model, id, action) =>
  action.type === "WebView.Activate" ?
    [activateByID(model, id), Effects.none] :
  action.type === "WebView.Close" ?
    [closeByID(model, id), Effects.none] :
  action.type === "WebView.Select" ?
    selectByID(model, id) :
    updateByIndex(model, indexByID(model, id), action);

const remove = (array, index) =>
    index < 0 ?
      array :
    index >= array.length ?
      array :
    index === 0 ?
      array.slice(1) :
    index === array.length - 1 ?
      array.slice(0, index) :
      array.slice(0, index).concat(array.slice(index + 1));

const set = (array, index, item) => {
  const items = array.slice(0)
  items[index] = item
  return items
}

export const getActiveURI = (model, fallback=null) => {
  const webView = getActive(model)
  return webView == null
    ? fallback
    : webView.navigation.currentURI
}

export const getByID = (model, id) =>
  getByIndex(model, id);

export const getActive = (model) =>
  getByIndex(model, model.active);

export const getByIndex = (model, index) =>
  index < 0 ? null :
  index >= model.entries.length ? null :
  model.entries[index];


const updateByIndex = (model, index, action) => {
  const {entries} = model;
  if (index < 0 || index >= entries.length) {
    console.warn(`WebView by index: ${index} is not found:`, model);
    return [model, Effects.none];
  } else {
    const [entry, fx] = WebView.update(entries[index], action);
    return [
      merge(model, {entries: set(entries, index, entry)}),
      fx.map(ByID(entry.id))
    ];
  }
}

const withForce = ([model, fx]) =>
  [model, Effects.batch([fx, Driver.Force])];


export const update/*:type.update*/ = (model, action) =>
    action.type === "NavigateTo"
  ? navigateTo(model, action.uri)
  : action.type === "Open"
  ? open(model, action.options)
  : action.type === "Open!WithMyIFrameAndInTheCurrentTick"
  ? withForce(open(model, action.options))
  : action.type === "SelectRelative"
  ? selectByOffset(model, action.offset)
  : action.type === "ActivateSelected"
  ? [activateSelected(model), Effects.none]
  : action.type === "ByActive"
  ? updateByActive(model, action.action)
  : action.type === "ByID"
  ? updateByID(model, action.id, action.action)
  : Unknown.update(model, action);

const style = StyleSheet.create({
  webviews: {
    // @TODO box shadow slows down animations significantly (Gecko)
    // boxShadow: '0 50px 80px rgba(0,0,0,0.25)',
    // @WORKAROUND use percent instead of vw/vh to work around
    // https://github.com/servo/servo/issues/8754
    height: '100%',
    width: '100%',
    left: 0,
    overflow: 'hidden', // necessary to clip the radius
    position: 'absolute', // to position webviews relatively to stack
    top: 0,
    willChange: 'transform',
    // WARNING: will slow down animations! (Gecko)
    // xBorderRadius: '4px',
  }
});

export const view/*:type.view*/ = (model, address, modeStyle) =>
  html.div({
    className: 'webviews-stack',
    style: Style(style.webviews, modeStyle)
  }, model
      .entries
      .map(entry => thunk(entry.id,
                          WebView.view,
                          entry,
                          forward(address, ByID(entry.id)))))

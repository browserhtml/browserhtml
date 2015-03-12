/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const {curry, compose, identity, True, False} = require('lang/functional');

  // Curried function that takes `name -> target` and returns
  // `target.get(name)`. Useful for getting value of the field
  // in immutable data structures and cursors.
  const get = curry((name, target) => target.get(name));

  // Curried function that takes `p -> items` and returns
  // `items.findIndex(p)` useful for finding index of item in
  // immutable collections and cursors.
  const findIndex = curry((p, items) => items.findIndex(p));

  // High order function that takes `p -> items` returns
  // `items.find(p)` useful for finding item in the immutable
  // collections and cursors.
  const find = curry((p, items) => items.find(p));


  // ## Overview
  //
  // Below function are used transforming state of the deck which
  // is represented as an immutable collection of items. API is
  // designed such that single item in the collection can be
  // **active** (visible web viewer is an example of active item).
  // Also single item can be **selected**, selected item may not
  // be an active item, since selection is used to represent transitive
  // state (ctl+tab selects a tab while release of keys activates
  // seleceted tab).

  // True if given item is active.
  const isActive = get('isActive');
  // True if given item is selected.
  const isSelected = get('isSelected');

  // Returuns index of active item from given deck `items`.
  const indexOfActive = findIndex(isActive);

  // Returns index of selected item from given deck `items`.
  const indexOfSelected = findIndex(isSelected);

  // Returns active item from a given deck `items`.
  const active = find(isActive);

  // Returns selected item from a given deck `items`.
  const selected = find(isSelected);


  // `next` and `previous` encode tab switching logic that takes
  // into account weather given `item` matches first / last item in the deck
  // `items`.
  const next = (items, item) => {
    const ordered = order(items);
    const isLast = order == items.count() - 1;
    return ordered.last() === item ? ordered.first() :
           ordered.get(ordered.indexOf(item) + 1);
  };

  const previous = (items, item) => {
    const ordered = order(items);
    return ordered.first() === item ? ordered.last() :
           ordered.get(ordered.indexOf(item) - 1);
  }

  const transition = (unmark, mark) => (items, from, to) =>
    from == to ? items : items.update(items.indexOf(from), unmark)
                              .update(items.indexOf(to), mark);

  const advance = (transition, from, to) => items => {
    const source = from(items);
    return transition(items, source, to(items, source));
  }

  const asSelected = item => item.update('isSelected', True);
  const asActive = item => item.update('isActive', True);

  const asUnselected = item => item.update('isSelected', False);
  const asInactive = item => item.update('isActive', False);

  const switchSelected = transition(asUnselected, asSelected);
  const switchActive = transition(asInactive, asActive);

  const select = (items, item) =>
    switchSelected(items, selected(items), item);

  // Takes `items` and selects item previous to currently selected one.
  // If selected item is first item, then last item is selected.
  const selectPrevious = advance(switchSelected,
                                 selected,
                                 previous);
  const selectNext = advance(switchSelected,
                             selected,
                             next);

  // Takes deck `items` and activates selected item.
  const activate = advance(switchActive,
                           active,
                           selected);

  // Resets currently selecetd tab back to the active one.
  const reset = items => select(items, active(items));


  const MAX_ORDER = Number.MAX_SAFE_INTEGER;
  const orderOf = item => item.get('order') || MAX_ORDER / 2;
  const order = items => items.sortBy(orderOf);

  // Returns `item` that when ordered will be in `n`th position
  // starting from `0`.
  const nth = (items, n) => items.sortBy(orderOf).get(n);

  const asNth = (items, n, item) => {
    const ordered = order(items);
    const before = items.get(n);
    const after = items.get(n + 1);
    const order = ((after - before) / 2) + before;
    return item.set('order', order);
  }

  const asFirst = (items, item) => {
    const order = orderOf(nth(items, 0)) / 2;
    return item.set('order', order);
  }

  const asLast = (items, item) => {
    const last = orderOf(nth(items, items.count() - 1));
    const order = last + ((MAX_ORDER - last) / 2);
    return item.set('order', order);
  }

  // Reorders `items` such that given `item` will be first and
  // rest items will remain as they were.
  const makeFirst = (items, item) =>
    items.set(items.indexOf(item), asFirst(items, item));

  const makeLast = (items, item) =>
    items.set(items.indexOf(item), asLast(items, item));

  // Reorders given `items` such that active item will be moved
  // to the tail of it.
  const reorder = items => makeLast(items, active(items));


  const activateNext = compose(activate, selectNext);
  const activatePrevious = compose(activate, selectPrevious);

  // Take an `items` and optional `p` predicate function and removes
  // first item where `p(item)` is true. If item to be removed happens
  // to be selected or active then it takes care of activating / selecting
  // different item according to logic explained in the inline comments
  // below.
  const remove = (items, p=exports.isActive) => {
    const target = items.find(p);
    const isActive = target == active(items);
    const isSelected = target == selected(items);

    if (isActive) {
      if (isSelected) {
        // If target is selected & active item that is also
        // a last one, activate previous and remove the target.
        if (target == order(items).last()) {
          return activatePrevious(items).remove(target);
        }
        // If target is selected & active item but isn't a
        // a last on, activate next & remove the target.
        else {
          return activateNext(items).remove(target);
        }
      }
      // If target is active but different one is selected then
      // activate selection and remove this item.
      else {
        return activate(items).remove(target);
      }
    } else {
      if (isSelected) {
        // If target isn't active but is selected and happens to be the last
        // one, then select previous item and remove target.
        if (target == order(items).last()) {
          return selectPrevious(items).remove(target);
        }
        // If target isn't active but is selected and does not happen to be
        // the last one, then select next item and remove target.
        else {
          return selectNext(items).remove(target);
        }
      }
      // If target neither selected nor active just remove it.
      else {
        return items.remove(target);
      }
    }
  };

  // Utility function that deselects currently selected item. Note that this
  // function will put `items` into state with no selection, there for it must
  // be used as a part of larger transform that will take care of selecting some
  // item. Also note that non of the tranfrom functions can not be used on a result
  // of this function as they assume to have a selected item.
  const deselect = items => items.update(indexOfSelected(items), asUnselected);

  // Utility function that deactivates currently active item. Note that this
  // function will put `items` into state with no active `item`, there for it
  // mest be used as a part of larger transform that takes care of activating
  // some `item`. Also keep in mind that most transform function can not be used
  // on a result of this function as they assume to have an active item.
  const deactivate = items => items.update(indexOfActive(items), asInactive);

  const insert = (items, item, index) => {
    const include = items =>
      index <= 0 ? items.push(asFirst(items, item)) :
      index >= items.count() - 1 ? items.push(asLast(items, item)) :
      items.push(asNth(items, index, item));

    const update = compose(include,
                           isSelected(item) ? deselect : identity,
                           isActive(item) ? deactivate : identity);

    return update(items);
  }

  // Appends `item` to the deck `items`. If appended `item` is marked
  // as `selected` or `active` also takes care of
  const append = (items, item) => insert(items, item, items.count());

  const prepend = (items, item) => insert(items, item, 0);

  // Exports:

  exports.isSelected = isSelected;
  exports.asSelected = asSelected;
  exports.asUnselected = asUnselected;
  exports.indexOfSelected = indexOfSelected;
  exports.selected = selected;
  exports.select = select;
  exports.selectNext = selectNext;
  exports.selectPrevious = selectPrevious;

  exports.isActive = isActive;
  exports.asActive = asActive;
  exports.asInactive = asInactive;
  exports.indexOfActive = indexOfActive;
  exports.orderOf = orderOf;
  exports.order = order;
  exports.active = active;
  exports.activate = activate;
  exports.activateNext = activateNext;
  exports.activatePrevious = activatePrevious;
  exports.reorder = reorder;
  exports.reset = reset;

  exports.remove = remove;
  exports.insert = insert;
  exports.append = append;
  exports.prepend = prepend;
});

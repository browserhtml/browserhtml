/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define((require, exports, module) => {

  'use strict';

  const Is = flag => item => item.get(flag);

  // Return `true` if given deck item is selected one.
  const isSelected = Is('isSelected');
  const isPreviewed = Is('isPreviewed');

  // Takes `f` edit function and returs the function that
  // takes `items` list and optional `isMatch` function, invoking
  // which will swap first item form items on which
  // `isMatch(item)` is `true` with `f(item)`. If `isMatch` is
  // not provided selected item is swapped.
  const edit = f => (items, isMatch=isSelected) => {
    const index = items.findIndex(isMatch);
    return items.set(index, f(items.get(index)));
  }

  const toggle = field => item => item.update(field, x => !x);

  // Takes item and toggles it's selection state, meaning if it is
  // selected it will be updated not to, and if it isn't it will update
  // to be selected.
  const toggleSelection = toggle('isSelected');
  const togglePreview = toggle('isPreviewed');

  const IndexOf = p => items => items.findIndex(p);

  // Takes `items` and returs the index of the selected one.
  const indexOfSelected = IndexOf(isSelected);
  const indexOfPreviewed = IndexOf(isPreviewed);

  const Find = p => items => items.find(p);

  // Takes `items` and returs the selected one.
  const selected = Find(isSelected);
  const previewed = Find(isPreviewed);

  const indexOfNext = (items, index) => {
    const isLast = index == items.count() - 1;
    return isLast ? 0 : index + 1;
  };

  const indexOfPrevious = (items, index) => {
    const isFirst = index == 0;
    return isFirst ? items.count() - 1 : index - 1;
  }


  const switchWith = (toggle, items, from, to) =>
    from == to ? items : items.withMutations(items =>
      items.update(from, toggle)
           .update(to, toggle));

  const Switch = (toggle, indexOf, step) => items => {
    const from = indexOf(items);
    const to = step(items, from);
    return switchWith(toggle, items, from, to);
  }


  // Takes `items` and selects item previous to currently selected one.
  // If selected item is first item, then last item is selected.
  const selectPrevious = Switch(toggleSelection,
                                indexOfSelected,
                                indexOfPrevious);

  const previewPrevious = Switch(togglePreview,
                                 indexOfPreviewed,
                                 indexOfPrevious);

  // Takes `items` and select item next to currently selected one,
  // unless it's last one in which case it selects the first item.
  // If only item is contained nothing happens.
  const selectNext = Switch(toggleSelection,
                            indexOfSelected,
                            indexOfNext);

  const previewNext = Switch(togglePreview,
                             indexOfPreviewed,
                             indexOfNext);

  const SwitchTo = (toggle, indexOf) => (items, isTo) => {
    const from = indexOf(items);
    const to = items.findIndex(isTo);
    return switchWith(toggle, items, from, to);
  }

  // Takes `items` and `shouldSelecet` predicate and switches selection
  // from currently selected item to the first item for which `shouldSelect(item)`
  // is true.
  const select = SwitchTo(toggleSelection, indexOfSelected);
  const preview = SwitchTo(togglePreview, indexOfPreviewed);

  // Take an `items` and optionally `shouldClose` function and updates items
  // to exclude first one for which `shouldClose(item)` is `true`. If `shouldClose`
  // is ommited returns items without item that is selected. If item excluded was
  // selected next item will be selected, unless selected item was last in which
  // case previous item will be selected.
  const remove = (items, shouldClose=isSelected) => {
    const closing = items.findIndex(shouldClose);
    const selected = items.findIndex(isSelected);
    const isCLosingSelected = closing == selected;
    const isLast = isCLosingSelected && closing == items.count() - 1;
    const reselected = !isCLosingSelected ? items :
                       isLast ? selectPrevious(items) :
                       selectNext(items);
    return reselected.remove(closing);
  };

  // Returns index of the last item from the given `items`.
  const isLast = (item, items) => item.equals(items.last());

  // Inesrts item after first item for which `shouldFollow(item)` is true,
  // if `shouldFollow` is ommited inserts item after last item.
  const insertAfter = (items, item, shouldFollow=isLast) => items => {
    const after = items.findIndex(item => shouldFollow(item, items));
    return items.slice(0, after).push(item).concat(items.slice(after));
  };

  const append = (items, item) => items.push(item);

  const isFirst = (item, items) => item.equals(items.first());

  // Inesrts item before first item for which `shouldFollow(item)` is true,
  // if `shouldFollow` is ommited inserts item before first item.
  const insertBefore = (items, item, shouldLead=isFirst) => items => {
    const before = items.findIndex(item => shouldLead(item, items));
    return before == 0 ? items.unshift(item) :
           items.slice(0, before - 1).push(item).concat(items.slice(before - 1));
  };

  const prepend = (items, item) => items.unshift(item);

  // Exports:

  exports.isSelected = isSelected;
  exports.edit = edit;
  exports.toggleSelection = toggleSelection;
  exports.indexOfSelected = indexOfSelected;
  exports.indexOfPreviewed = indexOfPreviewed;
  exports.selected = selected;
  exports.selectNext = selectNext;
  exports.selectPrevious = selectPrevious;
  exports.previewNext = previewNext;
  exports.previewPrevious = previewPrevious;
  exports.preview = preview;
  exports.previewed = previewed;
  exports.select = select;
  exports.remove = remove;
  exports.insertAfter = insertAfter;
  exports.append = append;
  exports.insertBefore = insertBefore;
  exports.prepend = prepend;

});

/* @flow */

/*::
import type {Cursor} from "../../type/common/cursor"
import type {Effects} from "reflex/type/effects"
*/

export const cursor = /*::<from, to, in, out>*/ (config/*:Cursor*/)/*:(model:from, action:in) => [from, Effects<out>]*/ => {
  const get = config.get;
  const set = config.set;
  const update = config.update;
  const tag = config.tag;

  return (model, action) => {
    const previous
      = get == null
      ? model
      : get(model);

    const [next, fx] = update(previous, action);
    const state
      = set == null
      ? next
      : set(model, next);

    return [state, tag == null ? fx : fx.map(tag)]
  }
}

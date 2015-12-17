/* @flow */

/*:: import * as type from "../../type/common/prelude" */
/*:: import {Effects} from "reflex/type/effects" */

export const asFor/*:type.asFor*/ = target => action =>
  ({type: "For", target, action})


export const merge = /*::<model:Object>*/(model/*:model*/, changes/*:{}*/)/*:model*/ => {
  let result = model
  for (let key in changes) {
    if (changes.hasOwnProperty(key)) {
      const value = changes[key]

      if (model[key] !== value) {
        if (result === model) {
          result = {}
          for (let key in model) {
            if (model.hasOwnProperty(key)) {
              result[key] = model[key]
            }
          }
        }

        result[key] = value
      }
    }
  }

  return result
}


export const take = /*::<item>*/(items/*:Array<item>*/, n/*:number*/)/*:Array<item>*/ =>
  items.length <= n ?
    items :
    items.slice(0, n)

export const move = /*::<item>*/(items/*:Array<item>*/, from/*:number*/, to/*:number*/)/*:Array<item>*/ => {
  const count = items.length
  if (from === to) {
    return items
  } else if (from >= count) {
    return items
  } else if (to >= count) {
    return items
  } else {
    const result = items.slice(0)
    const target = result.splice(from, 1)[0]
    result.splice(to, 0, target)
    return result
  }
}

const Always = {
  toString() {
    return `always(${this.value})`
  }
}

const alwaysSymbol = Symbol.for('always');

const Null = () => null;
const Void = () => void(0);

export const always = /*::<a>*/(a/*:a*/)/*:(...args:Array<any>)=>a*/ => {
  const value = a
  if (value === null) {
    return Null
  }
  else if (value === void(0)) {
    return Void
  }
  else if (value[alwaysSymbol] != null) {
    return value[alwaysSymbol]
  } else {
    const f = () => value
    f.value = value
    f.toString = Always.toString
    value[alwaysSymbol] = f
    return f
  }
}

/* @flow */
/*:: import * as type from "../../type/common/prelude" */



export const asFor/*:type.asFor*/ = target => action =>
  ({type: "For", target, action})


export const asOk/*:type.asOk*/ = value =>
  ({type: "Ok", value})

export const asError/*:type.asError*/ = error =>
  ({type: "Error", error})


export const merge = /*::<model>*/(model/*:model*/, changes/*:{}*/)/*:model*/ =>
  Object.assign({}, model, changes)

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

export const always = /*::<a>*/(a/*:a*/)/*:(...args:Array<any>)=>a*/ => {
  const value = a
  const f = () => value
  f.value = value
  f.toString = Always.toString
  return f
}

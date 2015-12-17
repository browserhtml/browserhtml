/* @flow */

export type ID = number
export type URI = string
export type Time = number
export type Version = string

export type merge = <model> (model:model, changes:{[key:string]: any}) => model

export type take = <item> (items:Array<item>, n:number) => Array<item>

export type move = <item> (items:Array<item>, from:number, to:number) => Array<item>

export type Always <a> = (a:a) => (...args:Array<any>) => a
export type always = <a> (a:a) => (...args:Array<any>) => a

export type For <target, action> = {
  type: "For",
  target: target,
  action: action
}

export type asFor <target, action> = (target:target) =>
  (action:action) => For<target, action>

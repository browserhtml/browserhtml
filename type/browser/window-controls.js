/* @flow */

import type {Address, VirtualTree} from "reflex/type"
import * as Shell from "../browser/shell"


export type view = (model:Shell.Model, address:Address<Shell.Action>) =>
  VirtualTree

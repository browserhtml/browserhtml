/* @flow */

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {html} from 'reflex';
import {Style, StyleSheet} from '../common/style';

const iconWidth = '30px';
const iconHeight = '32px';

const style = StyleSheet.create({
  icon: {
    fontFamily: 'FontAwesome',
    fontSize: '18px',
    lineHeight: iconHeight,
    position: 'absolute',
    textAlign: 'center',
    bottom: 0,
    right: 0,
    width: iconWidth,
    height: iconHeight,
  }
});

export const render = address =>
  html.div({
    className: 'global-create-tab-icon',
    style: style.icon
  }, ['']);

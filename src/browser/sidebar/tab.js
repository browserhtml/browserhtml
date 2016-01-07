import {html, thunk, Effects} from 'reflex';
import {Style, StyleSheet} from '../../common/style';
import {cursor, merge} from "../../common/prelude";
import * as Target from "../../common/target";
import * as Unknown from "../../common/unknown";
import * as WebView from '../web-view';

export const Model = ({isPointerOver}) =>
  ({isPointerOver});

export const initial = Model({isPointerOver: false});

const Point = action => ({type: "Point", action});

const point = cursor({
  get: (model) => model.tab,
  set: (model, tab) => merge(model, {tab}),
  update: Target.step,
  tag: Point
});

export const update = (model, action) =>
    action.type === "Point"
  ? point(model, action.action)
  : Unknown.step(model, action);

const style = StyleSheet.create({
  tab: {
    MozWindowDragging: 'no-drag',
    borderRadius: '5px',
    height: '34px',
    color: '#fff',
    overflow: 'hidden',
  },

  tabInner: {
    height: '34px',
    lineHeight: '34px',
    width: '312px',
    color: '#fff',
    fontSize: '14px',
    overflow: 'hidden',
    position: 'relative'
  },

  tabSelected: {
    backgroundColor: '#3D91F2'
  },

  closeMask: {
    background: `linear-gradient(
      to right,
      rgba(36,48,61,0) 0%,
      rgba(36,48,61,1) 20%,
      rgba(36,48,61,1) 100%)`,
    width: '34px',
    height: '34px',
    position: 'absolute',
    paddingLeft: '10px',
    right: 0,
    top: 0
  },

  closeMaskSelected: {
    background: `linear-gradient(
      to right,
      rgba(61,145,242,0) 0%,
      rgba(61,145,242,1) 20%,
      rgba(61,145,242,1) 100%)`
  },

  closeMaskHidden: {
    opacity: 0,
    pointerEvents: 'none'
  },

  closeIcon: {
    color: '#fff',
    fontFamily: 'FontAwesome',
    fontSize: '12px',
    width: '34px',
    height: '34px',
    lineHeight: '34px',
    textAlign: 'center'
  },

  title: {
    display: 'block',
    margin: '0 10px 0 34px',
    overflow: 'hidden',
    width: '270px',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  favicon: {
    borderRadius: '3px',
    left: '9px',
    position: 'absolute',
    top: '9px',
    width: '16px',
    height: '16px',
  }
});

const viewClose = ({isSelected, tab}, address) =>
  html.div({
    className: 'tab-close-mask',
    style: Style(
      style.closeMask,
      isSelected && style.closeMaskSelected,
      !tab.isPointerOver && style.closeMaskHidden
    )
  }, [
    html.div({
      className: 'tab-close-icon',
      style: style.closeIcon,
      onClick: () => address(WebView.Close)
    }, [''])
  ]);


const viewImage = (uri, style) =>
  html.img({
    style: Style({
      backgroundImage: `url(${uri})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      border: 'none'
    }, style)
  });

export const view = (model, address, {tabWidth, titleOpacity}) =>
  html.div({
    className: 'sidebar-tab',
    style: Style(
      style.tab,
      model.isSelected && style.tabSelected,
      {width: `${tabWidth}px`}
    ),
    onMouseOver: () => address(Point(Target.Over)),
    onMouseOut: () => address(Point(Target.Out)),
    onMouseDown: () => address(WebView.Select),
    onMouseUp: () => address(WebView.Activate)
  }, [
    html.div({
      className: 'sidebar-tab-inner',
      style: style.tabInner
    }, [
      thunk('favicon',
            viewImage,
            WebView.readFaviconURI(model),
            style.favicon),
      html.div({
        className: 'sidebar-tab-title',
        style: Style(
          style.title,
          {opacity: titleOpacity}
        )
      }, [
        // @TODO localize this string
        WebView.readTitle(model, 'Untitled')
      ]),
      thunk('close', viewClose, model, address)
    ])
  ]);

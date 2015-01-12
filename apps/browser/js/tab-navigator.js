/* this source code form is subject to the terms of the mozilla public
 * license, v. 2.0. if a copy of the mpl was not distributed with this
 * file, you can obtain one at http://mozilla.org/mpl/2.0/. */

define((require, exports, module) => {
  "use strict";

  const {Component} = require("js/component");
  const {html}  = require("js/virtual-dom");
  const {Link} = require("js/virtual-dom/link");

  const Tab = Component({
    displayName: "Tab",
    closeTab() {
      this.props.closeTab(this.props.frame);
    },

    onMouseUp(event) {
      event.preventDefault();
      if (event.button == 1) {
        this.oncloseTab();
      }
    },
    onCloseTab(event) {
      event.preventDefault();
      this.closeTab();
    },
    onSelectTab(event) {
      event.preventDefault();
      this.props.selectTab(this.props.frame);
    },

    render({frame, tabStyle}) {
      const { id, selected, title, favicon, loading, url } = frame;
      const classList = ["tab", "hbox", "align", "center",
                         loading ? "loading" : "loaded",
                         selected ? "selected" : ""];

      return html.div({
        className: classList.join(" "),
        onClick: this.onSelectTab,
        onMouseUp: this.onMouseUp
      }, [
        html.div({key: "throbber",
                  className: "throbber"}),
        html.img(Object.assign({key: "icon",
                                className: "favicon"},
                               favicon ? {src: favicon} : {src: null})),
        html.div({key: "title",
                  className: "hbox title title-wrapper"}, [
          html.span({className: "title"},
                    title || url || "New Tab")
        ]),
        html.button({key: "close-button",
                     title: "Close Tab",
                     className: "close-button",
                     onMouseUp: this.onCloseTab})
      ]);
    }
  });
  exports.Tab = Tab;

  function BuildCurvedTabs(document) {
    let window = document.defaultView;
    let curveDummyElt = document.querySelector('.dummy-tab-curve');
    let style = window.getComputedStyle(curveDummyElt);

    let curveBorder = style.getPropertyValue('--curve-border');
    let curveGradientStart = style.getPropertyValue('--curve-gradient-start');
    let curveGradientEnd = style.getPropertyValue('--curve-gradient-end');
    let curveHoverBorder = style.getPropertyValue('--curve-hover-border');
    let curveHoverGradientStart = style.getPropertyValue('--curve-hover-gradient-start');
    let curveHoverGradientEnd = style.getPropertyValue('--curve-hover-gradient-end');

    let c1 = document.createElement('canvas');
    c1.id = 'canvas-tab-selected';
    c1.hidden = true;
    c1.width = 3 * 28;
    c1.height = 28;
    drawBackgroundTab(c1, curveGradientStart, curveGradientEnd, curveBorder);
    document.body.appendChild(c1);

    let c2 = document.createElement('canvas');
    c2.id = 'canvas-tab-hover';
    c2.hidden = true;
    c2.width = 3 * 28;
    c2.height = 28;
    drawBackgroundTab(c2, curveHoverGradientStart, curveHoverGradientEnd, curveHoverBorder);
    document.body.appendChild(c2);


    function drawBackgroundTab(canvas, bg1, bg2, borderColor) {
      canvas.width = window.devicePixelRatio * canvas.width;
      canvas.height = window.devicePixelRatio * canvas.height;
      let ctx = canvas.getContext('2d');
      let r = canvas.height;
      ctx.save();
      ctx.beginPath();
      drawCurve(ctx, r);
      ctx.lineTo(3 * r, r);
      ctx.lineTo(0, r);
      ctx.closePath();
      ctx.clip();

      // draw background
      let lingrad = ctx.createLinearGradient(0, 0 ,0, r);
      lingrad.addColorStop(0, bg1);
      lingrad.addColorStop(1, bg2);
      ctx.fillStyle = lingrad;
      ctx.fillRect(0, 0, 3*r, r);

      // draw border
      ctx.restore();
      ctx.beginPath();
      drawCurve(ctx, r);
      ctx.strokeStyle = borderColor;
      ctx.stroke();
    }

    function drawCurve(ctx, r) {
      let firstLine = 1 / window.devicePixelRatio;
      ctx.moveTo(r * 0, r * 0.984);
      ctx.bezierCurveTo(r * 0.27082458, r * 0.95840561,
                        r * 0.3853096, r * 0.81970962,
                        r * 0.43499998, r * 0.5625);
      ctx.bezierCurveTo(r * 0.46819998, r * 0.3905,
                        r * 0.485, r * 0.0659,
                        r * 0.95,  firstLine);
      ctx.lineTo(r + r * 1.05, firstLine);
      ctx.bezierCurveTo(3 * r - r * 0.485, r * 0.0659,
                        3 * r - r * 0.46819998, r * 0.3905,
                        3 * r - r * 0.43499998, r * 0.5625);
      ctx.bezierCurveTo(3 * r - r * 0.3853096, r * 0.81970962,
                        3 * r - r * 0.27082458, r * 0.95840561,
                        3 * r - r * 0, r * 0.984);
    }
  }

  const TabNavigator = Component({
    displayName: "TabNavigator",
    onStyleReady({target}) {
      // Todo: Inline BuildCurvedTabs or move it to a separate
      // module instead of just keeping a copy around.
      BuildCurvedTabs(target.ownerDocument);
    },

    closeTab(frame) {
      this.props.closeTab(frame);
    },
    selectTab(frame) {
      this.props.selectTab(frame);
    },

    renderTab(frame) {
      return Tab({
        frame,
        key: `tab-${frame.id}`,
        closeTab: this.closeTab,
        selectTab: this.selectTab,
        tabStyle: this.props.tabStyle
      });
    },
    render({frames, tabStyle}) {
      const link = tabStyle == "vertical" ?
                   Link({rel: "stylesheet",
                         href: "css/sidetabs.css"}) :
                   Link({rel: "stylesheet",
                         href: "css/tabstrip.css",
                         onLoad: this.onStyleReady});

      const className = tabStyle == "vertical" ?
                        "vbox pack start verticaltabstrip" :
                        "tabstrip toolbar hbox";

      return html.div({className}, [
        link,
        ...frames.map(this.renderTab)
      ]);
    }
  });
  exports.TabNavigator = TabNavigator;
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * tab.js
 *
 * This code controls the UI of the tabs.
 * A tab is: a favicon, a title and the close button.
 * The web content is *not* handled here, but in the
 * tabiframe.js file.
 *
 */


require(['js/tabiframedeck'], function(TabIframeDeck) {

  "use strict";

  const allTabs = new Map();

  function Tab(tabIframe) {
    let hbox = document.createElement("hbox");
    hbox.className = "tab";
    hbox.setAttribute("align", "center");

    let throbber = document.createElement("div");
    throbber.className = "throbber";

    let favicon = document.createElement("img");
    favicon.className = "favicon";

    let title = document.createElement("hbox");
    title.className = "title";

    let button = document.createElement("button");
    button.className = "close-button";

    button.onclick = (event) => {
      event.stopPropagation();
      TabIframeDeck.remove(tabIframe);
    };

    hbox.onclick = (event) => {
      TabIframeDeck.select(tabIframe);
    };

    hbox.appendChild(throbber);
    hbox.appendChild(favicon);
    hbox.appendChild(title);
    hbox.appendChild(button);

    this._dom = hbox;

    this._tabIframe = tabIframe;
    this._trackTabIframe();

    document.querySelector(".tabstrip").appendChild(this._dom);

    this.updateDom();
  }

  Tab.prototype = {

    get tabIframe() {
      return this._tabIframe;
    },

    get dom() {
      return this._dom;
    },

    destroy: function() {
      this._untrackTabIframe();
      this._tabIframe = null;
      this.dom.remove();
    },

    select: function() {
      this.dom.classList.add("selected");
    },

    unselect: function() {
      this.dom.classList.remove("selected");
    },

    _trackTabIframe: function() {
      this.updateDom = this.updateDom.bind(this);
      this.tabIframe.on("dataUpdate", this.updateDom);
    },

    _untrackTabIframe: function() {
      this.tabIframe.off("dataUpdate", this.updateDom);
    },

    updateDom: function() {
      if (this.tabIframe.loading) {
        this.dom.classList.add("loading");
      } else {
        this.dom.classList.remove("loading");
      }

      if (this.tabIframe.title) {
        this.dom.querySelector(".title").textContent = this.tabIframe.title;
      } else {
        if (this.tabIframe.location) {
          this.dom.querySelector(".title").textContent = this.tabIframe.location;
        } else {
          this.dom.querySelector(".title").textContent = "New Tab";
        }
      }

      let faviconImg = this.dom.querySelector(".favicon");
      if (this.tabIframe.favicon) {
        faviconImg.src = this.tabIframe.favicon;
      } else {
        faviconImg.removeAttribute("src");
      }
    },
  };

  TabIframeDeck.on("add", (event, detail) => {
    let tabIframe = detail.tabIframe;
    let tab = new Tab(tabIframe);
    allTabs.set(tabIframe, tab);
    if (tabIframe == TabIframeDeck.getSelected()) {
      tab.select();
    }
  });

  TabIframeDeck.on("remove", (event, detail) => {
    let tab = allTabs.get(detail.tabIframe);
    if (tab) {
      tab.destroy();
      allTabs.delete(detail.tabIframe);
    }
  });

  TabIframeDeck.on("select", (event, detail) => {
    let tab = allTabs.get(detail.tabIframe);
    if (tab) {
      tab.select();
    }
  });

  TabIframeDeck.on("unselect", (event, detail) => {
    let tab = allTabs.get(detail.tabIframe);
    if (tab) {
      tab.unselect();
    }
  });

  for (let tabIframe of TabIframeDeck) {
    let tab = new Tab(tabIframe);
    allTabs.set(tabIframe, tab);
  }

  let tabIframe = TabIframeDeck.getSelected();
  let tab = allTabs.get(tabIframe);
  tab.select();

  /* Build curved tabs */

  if (document.readyState == "complete") {
    BuildCurvedTabs();
  } else {
    document.addEventListener("readystatechange", onDocumentLoaded);
  }

  function onDocumentLoaded() {
    if (document.readyState == "complete") {
      document.removeEventListener("readystatechange", onDocumentLoaded);
      BuildCurvedTabs();
    }
  }

  function BuildCurvedTabs() {
    let curveDummyElt = document.querySelector(".dummy-tab-curve");
    let style = window.getComputedStyle(curveDummyElt);

    let curveBorder = style.getPropertyValue("--curve-border");
    let curveGradientStart = style.getPropertyValue("--curve-gradient-start");
    let curveGradientEnd = style.getPropertyValue("--curve-gradient-end");
    let curveHoverBorder = style.getPropertyValue("--curve-hover-border");
    let curveHoverGradientStart = style.getPropertyValue("--curve-hover-gradient-start");
    let curveHoverGradientEnd = style.getPropertyValue("--curve-hover-gradient-end");

    let c1 = document.createElement("canvas");
        c1.id = "canvas-tab-selected";
        c1.hidden = true;
        c1.width = 3 * 28;
        c1.height = 28;
    drawBackgroundTab(c1, curveGradientStart, curveGradientEnd, curveBorder);
    document.body.appendChild(c1);

    let c2 = document.createElement("canvas");
        c2.id = "canvas-tab-hover";
        c2.hidden = true;
        c2.width = 3 * 28;
        c2.height = 28;
    drawBackgroundTab(c2, curveHoverGradientStart, curveHoverGradientEnd, curveHoverBorder);
    document.body.appendChild(c2);


    function drawBackgroundTab(canvas, bg1, bg2, borderColor) {
      canvas.width = window.devicePixelRatio * canvas.width;
      canvas.height = window.devicePixelRatio * canvas.height;
      let ctx = canvas.getContext("2d");
      let r = canvas.height;
      ctx.save();
      ctx.beginPath();
      drawCurve(ctx,r);
      ctx.lineTo(3 * r, r);
      ctx.lineTo(0, r);
      ctx.closePath();
      ctx.clip();

      // draw background
      let lingrad = ctx.createLinearGradient(0,0,0,r);
      lingrad.addColorStop(0, bg1);
      lingrad.addColorStop(1, bg2);
      ctx.fillStyle = lingrad;
      ctx.fillRect(0,0,3*r,r);

      // draw border
      ctx.restore();
      ctx.beginPath();
      drawCurve(ctx,r);
      ctx.strokeStyle = borderColor;
      ctx.stroke();
    }

    function drawCurve(ctx,r) {
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

});

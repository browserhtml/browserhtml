/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * tabiframe.js
 *
 * tabiframe implements the <tab-iframe> tab. It's a wrapper
 * around a <iframe mozbrowser>.
 *
 */

define(['js/eventemitter', 'js/urlhelper'],
function(EventEmitter, UrlHelper) {

  'use strict';

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2;

  const IFRAME_EVENTS = [
    'mozbrowserasyncscroll', 'mozbrowserclose', 'mozbrowsercontextmenu',
    'mozbrowsererror', 'mozbrowsericonchange', 'mozbrowserloadend',
    'mozbrowserloadstart', 'mozbrowserlocationchange', 'mozbrowseropenwindow',
    'mozbrowsersecuritychange', 'mozbrowsershowmodalprompt', 'mozbrowsertitlechange',
    'mozbrowserusernameandpasswordrequired'
  ];

  let tabIframeProto = Object.create(HTMLElement.prototype);

  tabIframeProto.setLocation = function(url) {
    if (!this._innerIframe) {
      this._createInnerIframe();
    }
    if (window.IS_PRIVILEGED) {
      this._innerIframe.src = url;
    } else {
      this._innerIframe.src = 'data:,' + url;
    }
  };

  tabIframeProto.willBeVisibleSoon = function() {
    if (window.IS_PRIVILEGED && this._innerIframe) {
      this._innerIframe.setVisible(true);
    }
  };

  tabIframeProto.show = function() {
    this.removeAttribute('hidden');
    if (window.IS_PRIVILEGED && this._innerIframe) {
      this._innerIframe.setVisible(true);
    }
    this.emit('visible');
  };

  tabIframeProto.hide = function() {
    this.setAttribute('hidden', 'true');
    if (window.IS_PRIVILEGED && this._innerIframe) {
      this._innerIframe.setVisible(false);
    }
    this.emit('hidden');
  };

  tabIframeProto.createdCallback = function() {
    this._zoom = 1;
    this._clearTabData();
    EventEmitter.decorate(this);
  };

  tabIframeProto._createInnerIframe = function() {
    let iframe = document.createElement('iframe');
    iframe.setAttribute('mozbrowser', 'true');
    iframe.setAttribute('flex', '1');
    iframe.setAttribute('remote', 'true');
    iframe.setAttribute('mozallowfullscreen', 'true');
    this.appendChild(iframe);
    for (let eventName of IFRAME_EVENTS) {
      iframe.addEventListener(eventName, this);
    }
    this._innerIframe = iframe;
    this._applyZoom();
  };

  tabIframeProto.attachedCallback = function() {
  };

  tabIframeProto.detachedCallback = function() {
    if (this._innerIframe) {
      for (let eventName of IFRAME_EVENTS) {
        this._innerIframe.removeEventListener(eventName, this);
      }
    }
    if (this._faviconXHR) {
      this._faviconXHR.abort();
    }
  };

  tabIframeProto.zoomIn = function() {
    this._zoom += 0.1;
    this._zoom = Math.min(MAX_ZOOM, this._zoom);
    this._applyZoom();
  };

  tabIframeProto.zoomOut = function() {
    this._zoom -= 0.1;
    this._zoom = Math.max(MIN_ZOOM, this._zoom);
    this._applyZoom();
  };

  tabIframeProto.resetZoom = function() {
    this._zoom = 1;
    this._applyZoom();
  };

  tabIframeProto._applyZoom = function() {
    if (this._innerIframe && window.IS_PRIVILEGED) {
      this._innerIframe.zoom(this._zoom);
    }
  };

  tabIframeProto.reload = function() {
    if (this._innerIframe) this._innerIframe.reload();
  };

  tabIframeProto.stop = function() {
    if (this._innerIframe) this._innerIframe.stop();
  };

  tabIframeProto.goBack = function() {
    if (this._innerIframe) this._innerIframe.goBack();
  };

  tabIframeProto.goForward = function() {
    if (this._innerIframe) this._innerIframe.goForward();
  };

  tabIframeProto._clearTabData = function() {
    this._loading = false;
    this._title = '';
    this._location = '';
    this._contentScrollTop = 0;
    this._icons = {};
    this._securityState = 'insecure';
    this._securityExtendedValidation = false;
  };

  Object.defineProperty(tabIframeProto, 'loading', {
    get: function() {
      return this._loading;
    }
  });

  Object.defineProperty(tabIframeProto, 'title', {
    get: function() {
      return this._title;
    }
  });

  Object.defineProperty(tabIframeProto, 'location', {
    get: function() {
      return this._location;
    }
  });

  Object.defineProperty(tabIframeProto, 'contentScrollTop', {
    get: function() {
      return this._contentScrollTop;
    }
  });

  Object.defineProperty(tabIframeProto, 'icons', {
    get: function() {
      return this._icons;
    }
  });

  Object.defineProperty(tabIframeProto, 'securityState', {
    get: function() {
      return this._securityState;
    }
  });

  Object.defineProperty(tabIframeProto, 'securityExtendedValidation', {
    get: function() {
      return this._securityExtendedValidation;
    }
  });

  tabIframeProto.canGoBack = function() {
    return new Promise((resolve, reject) => {
      if (!this._innerIframe) {
        return resolve(false);
      }
      this._innerIframe.getCanGoBack().onsuccess = r => {
        return resolve(r.target.result);
      };
    });
  };

  tabIframeProto.canGoForward = function() {
    return new Promise((resolve, reject) => {
      if (!this._innerIframe) {
        return resolve(false);
      }
      this._innerIframe.getCanGoForward().onsuccess = r => {
        return resolve(r.target.result);
      };
    });
  };

  tabIframeProto.focus = function() {
    if (this._innerIframe) {
      this._innerIframe.focus();
    }
  };

  tabIframeProto.userInput = '';

  tabIframeProto.getIcon = function(bestSize) {
    // FIXME: use bestSize
    return this._icons.favicon || this._icons.favicon;
  };

  tabIframeProto._getOriginFavicon = function() {
    if (this._faviconXHR) {
      this._faviconXHR.abort();
    }
    let origin = UrlHelper.getOrigin(this.location);
    let url = origin + '/favicon.ico';
    let xhr = new XMLHttpRequest({ mozSystem: true, mozAnon: true });
    xhr.timeout = 10 * 1000;
    xhr.onload = () => {
      // Simulate a mozbrowsericonchange event
      if (!this._icons.favicon) {
        this.handleEvent({
          type: 'mozbrowsericonchange',
          detail: {
            fromOrigin: true,
            href: url
          }
        });
      }
    };
    xhr.open('GET', url, true);
    xhr.send();
    this._faviconXHR = xhr;
  };

  tabIframeProto.handleEvent = function(e) {
    switch (e.type) {
      case 'mozbrowserloadstart':
        this._clearTabData();
        this._loading = true;
        break;
      case 'mozbrowserloadend':
        this._loading = false;
        break;
      case 'mozbrowsertitlechange':
        this._title = e.detail;
        break;
      case 'mozbrowserlocationchange':
        this.userInput = '';
        this._location = e.detail;
        this._getOriginFavicon();
        break;
      case 'mozbrowsericonchange':
        // FIXME: e.details.sizes = "72x72"
        if (e.detail.rel == "apple-touch-icon") {
          this._icons.appleTouchIcon = e.detail.href;
        } else {
          this._icons.favicon = e.detail.href;
        }
        break;
      case 'mozbrowserasyncscroll':
        if (e.detail.top == this._contentScrollTop) {
          // Don't forward event
          return;
        }
        this._contentScrollTop = e.detail.top;
        break;
      case 'mozbrowsererror':
        this._loading = false;
        break;
      case 'mozbrowsersecuritychange':
        this._securityState = e.detail.state;
        this._securityExtendedValidation = e.detail.extendedValidation;
        break;
    }

    // Forward event
    this.emit(e.type, e, this);
  };

  let TabIframe = document.registerElement('tab-iframe', {prototype: tabIframeProto});
  return TabIframe;
});

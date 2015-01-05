[![build](https://travis-ci.org/mozilla/browserhtml.svg?branch=master)](https://travis-ci.org/mozilla/browserhtml)

![light theme](https://cloud.githubusercontent.com/assets/373579/5355479/d4d650d8-7f93-11e4-9645-88c93c8c495a.png)

![black theme](https://cloud.githubusercontent.com/assets/373579/5382222/a9bc89d8-80a8-11e4-86ad-46a128a67fc5.png)

Screencast: https://www.youtube.com/watch?v=IBzrCmGVDkA

Browser.html: an experimental Desktop browser, based on Firefox Desktop and Firefox OS. UI is built in HTML.

**Setup**

0. Install [Firefox Nightly](http://nightly.mozilla.org/)
1. `npm start` to start the browser

**Hacking**

Frontend code is located in `apps/browser`. `Cmd/Ctrl-Shift-R` to reload
the whole browser (no restart required).

**The App**

Browser.html is a HTML app (like any B2G app). It is based on the
[Browser API](https://developer.mozilla.org/en-US/docs/DOM/Using_the_Browser_API)
and works the same way Gaia's browser and system apps work.
Even though it includes tags like *vbox*, *hbox*, *spacer*, …, it's all HTML
(see `layout.css` to see how they mimic xul layout).

Current priority is to re-implement the basic features of Firefox Desktop to
make Browser.html a usable browser, and understand what's missing at the
platform level for a perfect integration to the OS.

**The Runtime**

Browser.html requires a runtime. As for now, we use Firefox Nightly
and a wrapper (see `runtime` directory).

It uses a `xul:window` that loads the Browser.html app into an iframe. The
`xul:window` is still required to build a native window (draw in title bar,
support opening animations, native colors, …). Eventually, we want to kill
this window and bring these native features to HTML. This window is nothing
but a window with window controls (close, minimize, maximize).

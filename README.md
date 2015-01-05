[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/paulrouget/firefox.html?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![build](https://travis-ci.org/paulrouget/firefox.html.svg?branch=master)](https://travis-ci.org/paulrouget/firefox.html)

![light theme](https://cloud.githubusercontent.com/assets/373579/5355479/d4d650d8-7f93-11e4-9645-88c93c8c495a.png)

![black theme](https://cloud.githubusercontent.com/assets/373579/5382222/a9bc89d8-80a8-11e4-86ad-46a128a67fc5.png)

Screencast: https://www.youtube.com/watch?v=IBzrCmGVDkA

Firefox.html is an experiment, a proof of concept: trying to re-implement the Firefox UI in HTML, as an app (à la B2G).

**Rationale:** We are working hard on making HTML fast and rich enough to build
a whole operating system (Firefox OS) and a browser (Firefox OS' browser
is built in HTML). Firefox Desktop is built in a different way (XUL). With a UI
in HTML leveraging the [Browser API](https://developer.mozilla.org/en-US/docs/DOM/Using_the_Browser_API),
we could drop XUL and close the gap between B2G and Firefox Desktop.
And eventually be able to render Firefox Desktop with [Servo](https://github.com/servo/servo)
(which will never support XUL). And maybe, one day, host the Firefox UI online (trusted app?).

**Setup**

1. Clone this repository somewhere on your computer using `git clone --recursive https://github.com/paulrouget/firefox.html`
2. Download HTMLRunner runtime: http://people.mozilla.org/~prouget/htmlrunner/ (package is named `firefox-XX.XX`);
3. Run HTMLRunner runtime (binary name is `firefox`);
4. HTMLRunner will ask (only once) the location of the `firefox.html` directory you cloned in step 1;
5. You should now see the browser running.

Note: If you have cloned without `--recursive`, you may find out that `lib/require.js` is empty. To fix this:

````
git submodule update --init
````

**Contribute**

See [`HACKING.md`](HACKING.md).

![Firefox.html screenshot](https://cloud.githubusercontent.com/assets/373579/5206795/f2153b1c-75a4-11e4-8bb7-da6c94c0a050.png)

**The App**

Firefox.html is a HTML app (like any B2G app). It is based on the
[Browser API](https://developer.mozilla.org/en-US/docs/DOM/Using_the_Browser_API)
and works the same way Gaia's browser and system apps work.
Even though it includes tags like *vbox*, *hbox*, *spacer*, …, it's all HTML
(see `layout.css` to see how they mimic xul layout).

Current priority is to re-implement the basic features of Firefox Desktop to
make Firefox.html a usable browser, and understand what's missing at the
platform level for a perfect integration to the OS.

**The Runtime**

Firefox.html requires a runtime: a special build of Gecko we call "htmlrunner".
The runtime code is based on Firefox.
See the [htmlrunner branch](https://github.com/paulrouget/gecko-dev/tree/htmlrunner)
branch on my `gecko-dev` repository.

It uses a `xul:window` that loads the Firefox.html app into an iframe. The
`xul:window` is still required to build a native window (draw in title bar,
support opening animations, native colors, …). Eventually, I want to kill
this window and bring these native features to HTML. This window is nothing
but a window with window controls (close, minimize, maximize).

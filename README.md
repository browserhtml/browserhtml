![screenshot](https://cloud.githubusercontent.com/assets/373579/5355479/d4d650d8-7f93-11e4-9645-88c93c8c495a.png)


Firefox.html is an experiment, a proof of concept: trying to re-implement the Firefox UI in HTML, as an app (à la B2G).

[Screencast](http://people.mozilla.org/~prouget/firefoxhtml.mp4) & [screenshots](https://github.com/paulrouget/firefox.html/issues/11)

**Rationale:** We are working hard on making HTML fast and rich enough to build
a whole operating system (Firefox OS) and a browser (Firefox OS' browser
is built in HTML). Firefox Desktop is built in a different way (XUL). With a UI
in HTML leveraging the [Browser API](https://developer.mozilla.org/en-US/docs/DOM/Using_the_Browser_API),
we could drop XUL and close the gap between B2G and Firefox Desktop.
And eventually be able to render Firefox Desktop with [Servo](https://github.com/servo/servo)
(which will never support XUL). And maybe, one day, host the Firefox UI online (trusted app?).

**Current code** is ugly (really). It works on Linux, Windows and Mac.
The browser supports basic features (tabs, navigation, history, ssl, devtools, search, zoom, …).

The project is split in two modules: **the app** and **the runtime (HTMLRunner)** (see below for details).

![Firefox.html screenshot](https://cloud.githubusercontent.com/assets/373579/5206795/f2153b1c-75a4-11e4-8bb7-da6c94c0a050.png)

**Setup**

1. Clone this repository somewhere on your computer;
2. Download HTMLRunner runtime: http://people.mozilla.org/~prouget/htmlrunner/ (package is named `firefox-XX.XX`);
3. Run HTMLRunner runtime (binary name is `firefox`);
4. HTMLRunner will ask (only once) the location of the `firefox.html` directory you cloned in step 1;
5. You should now see the browser running.

**How to change code**

1. Change code in the `firefox.html` directory
2. Press `Ctrl/Cmd-Shift-R` to run the new code (doesn't work on Windows. See [issue 12](https://github.com/paulrouget/firefox.html/issues/12))
3. Submit PR :)

![No build process](https://cloud.githubusercontent.com/assets/373579/5208414/3d48ec64-75b4-11e4-942d-64e194c57b9f.gif)

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

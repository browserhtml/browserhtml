## The App

Firefox.html is a reimplementation of Firefox Desktop UI in HTML.
The goal is to close the gap between B2G and Firefox Desktop. Maybe
one day it will be possible to render it with Servo (as it doesn't
require XUL).

Firefox.html is a HTML app (like any B2G app). It uses the Browser API
(https://developer.mozilla.org/en-US/docs/DOM/Using_the_Browser_API).
No XUL is used at all.

Current work aims to re-implement as many features of Firefox Desktop
as possible.

## The Runtime

Firefox.html requires a runtime: a special build of Gecko I call "htmlrunner".
See: https://github.com/paulrouget/gecko-dev/tree/htmlrunner

It uses a `xul:window` that loads the Firefox.html app into an iframe. The
`xul:window` is still required to build a native window (draw in title bar,
support opening animations, native colors, ...). Eventually, I want to kill
this window and bring these native features to HTML. This window is nothing
but a window with window controls (close,minimize,maximize) and a background
with the right color.

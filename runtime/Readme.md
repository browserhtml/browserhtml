# Firebox

Application runtime shared with [Firefox][] that can be used to write cross platform desktop applications such as [Firefox][] using web technologies & [nodejs][] style JS modules system. Firebox applications are [npm][] packages with a bundled HTML document gets to require modules from the package and it's dependencies.

## Features

- Apps written in modern HTML5, CSS3, JS and WebGL.
- Support for [nodejs][] style module system and with most node APIs exposed via modules.
- Support for [XUL][]+[XPCOM][]+[JSCTypes][] to overcome webplatform limitations when necessary.
- Easy to package and distribute apps.
- Available on Linux, Mac OS X and Windows

## Usage

For now you are required to have a Firefox [Nightly][] build to run firebox apps. Usage is little complicated for now but it's going to get better soon.

```sh
/Applications/FirefoxNightly.app/Contents/MacOS/firefox -app /path/to/firebox/application.ini /path/to/app/
```

During development you may want to use debugger. You can start debugger by passing additional arguments:

```sh
/Applications/FirefoxNightly.app/Contents/MacOS/firefox -app /path/to/firebox/application.ini /path/to/app/ -debugger 6000
```

Above comment will start debugger that will listen on port `6000`. You can connect to it via Firefox [WebIDE][] or via remote debugger by going to `Tools > WebDeveloper > Connect...`.

## Quick Start

As a first step you would need to setup a npm package for your application, by creating `package.json` file, which can be as simple as:

```json
{
  "name": "hello-firebox"
}
```

Your application will need some UI which is defined in HTML/CSS/JS there for you would need to create `index.html` document. (If you'd prefer to have a different name for entry document, just add `launchPath` key to a `package.json` with a value that is a relative path to entry document with in your package).

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Hello World!</title>
  </head>
  <body>
    <h1>Hello World!</h1>
    You have access to require <script>document.write(typeof(require))</script>.
  </body>
</html>
```


[Firefox]:https://www.mozilla.org/en-US/firefox/desktop/
[XULRunner]:https://developer.mozilla.org/en-US/docs/Mozilla/Projects/XULRunner
[node-webkit]:https://github.com/rogerwang/node-webkit
[XUL]:https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL
[XPCOM]:https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM
[JSCTypes]:https://developer.mozilla.org/en-US/docs/Mozilla/js-ctypes
[Nightly]:https://nightly.mozilla.org/
[WebIDE]:https://developer.mozilla.org/en-US/docs/Tools/WebIDE
[npm]:http://nodejs.org/
[nodejs]:http://nodejs.org/

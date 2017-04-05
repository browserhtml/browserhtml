[![build](https://travis-ci.org/browserhtml/browserhtml.svg?branch=master)](https://travis-ci.org/browserhtml/browserhtml) [![slack](https://browserhtml-slackin.herokuapp.com/badge.svg)](https://browserhtml-slackin.herokuapp.com/)

# Browser.html

*Browser.html* is a research project aimed at building an experimental [Servo](https://github.com/servo/servo) browser in HTML. This project has 2 major pieces:

- _Graphene_: a runtime for building native apps in HTML. It's currently in development and part of Servo.
- _Browser.html_: an experimental browser UI for desktop.

This repository is for Browser.html (the front-end). Active development of Graphene happens in the [Servo](https://github.com/servo/servo) repository. Questions? Check out the [FAQ](https://github.com/browserhtml/browserhtml/wiki/FAQ).

![browser](./browser.gif)

## Contributing

We welcome contributions from anyone. See [CONTRIBUTING.md](https://github.com/browserhtml/browserhtml/blob/master/CONTRIBUTING.md) for help getting started.


## Development

There are two major components to the browser.html application.

1. Local server that serves application UI.
2. Client that is a application shell that connects to the server and renders served UI.


### Server

If you're working on the Browser.html front-end, you'll need a [node][] to install all dependcies and run development toolchain.

``` sh
git clone https://github.com/browserhtml/browserhtml.git
cd browserhtml
npm install --no-optional
```

Once all dependencies are installed, you can run a server component with following command:

``` sh
npm run build-server
```

Any changes to the source code will trigger a build, once complete server will serve a new version. That will allow you to reload a client in order to see your changes. Alternatively you could run a "live server" which also re-builds on changes, but in addition it also provides live code reload for the UI such that application state is preserves and no reload of the client is required. You can run "live server" with a following command:

```sh
npm run live-server
```

### Client

In order to run browser.html application itself, you will need a client component. This would be a Graphene runtime, built into a servo binary. You can either [download][servo download] pre-built nightly snapshots or [build it yourself][bulid servo] and run with `--browserhtml` flag. Assuming you have pre-built snapshot in default location on a Mac you can run browser.html application with a following command:


``` sh
 /Applications/Servo.app/Contents/MacOS/servo -b -w --pref dom.mozbrowser.enabled --pref dom.forcetouch.enabled --pref shell.builtin-key-shortcuts.enabled=false http://localhost:6060
```

### Gecko Client

Browser.html can also be run on top of a Gecko-based version of Graphene. We used to use this variant to test and debug features that were not yet in Servo. You could either [download][dowload gecko] pre-build nightly snapshots or [build it yourself](https://github.com/browserhtml/browserhtml/wiki/Building-Graphene-%28Gecko-flavor%29). Assuming you have pre-build snapshot in default location on a Mac you can run browser.html appliaction with a following command:

```sh
/Applications/B2G.app/Contents/MacOS/b2g-bin --start-manifest=http://localhost:6060/manifest.webapp --profile ./.profile
```

### Electron Client

Browser.html can also run as an [Electron][] application. Assuming you have `electron` installed you could run browser.html application with a following command (must be run from the project root):

```sh
electron .
```

### Browser Client

You could also just load http://localhost:6060/ in your favourite web browser, but be aware that very few features will work in this case given that application additional API not available for web content. 


[download servo]:https://download.servo.org/
[node]:(https://nodejs.org/)
[npm]:https://www.npmjs.com/
[build servo]:https://github.com/servo/servo/blob/master/docs/HACKING_QUICKSTART.md
[download gecko]:https://ftp.mozilla.org/pub/b2g/nightly/latest-mozilla-central/
[Electron]:https://electron.atom.io/

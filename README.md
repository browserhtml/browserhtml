[![build](https://travis-ci.org/mozilla/browser.html.svg?branch=master)](https://travis-ci.org/mozilla/browser.html)

*browser.html* is a platform research project aimed at building native apps in HTML using [Servo](https://github.com/servo/servo). The project has 2 major pieces:

- _Graphene_: a runtime for building native apps in HTML. It's currently in development and part of Servo.
- _Browser.html_: An experimental browser UI for desktop.

This repository is for Browser.html (the front-end). Active development of Graphene happens in the [Servo](https://github.com/servo/servo) repository.

We welcome contributions from anyone. See our [contribution wiki page](https://github.com/mozilla/browser.html/wiki/Contributing) for help getting started.


### Prerequisites and Setup

You'll need [Node](https://nodejs.org/) and NPM to develop and run the UI locally.

```sh
npm install --no-optional
npm start
```


### Running in Servo

First, [build Servo](https://github.com/servo/servo#prerequisites).

Then, start the front-end local server:

    npm run build-server

Finally, start Servo with the browser.html flags turned on in either debug (`-d`) or release (`-r`) mode:

    ./mach run -r -- -b --pref dom.mozbrowser.enabled http://localhost:6060


### Running in Gecko

Browser.html can also be run in Gecko-based variant of Graphene. Since Servo is currently under rapid development, we sometimes use this build to prototype, debug and test the UI. Build instructions for Gecko-flavored Graphene can be found [on the wiki](https://github.com/mozilla/browser.html/wiki/Building-Graphene-%28Gecko-flavor%29).


### Using WebIDE

The easiest way to use developer tools with Browser.html is to select the "Remote Runtime" option in WebIDE while using the Gecko Graphene runtime.

By default you should be able to connect to the running browser at: localhost:6000.


### Integration Tests

Run integration tests with `./test/runall.sh`. You need to have a Graphene Gecko binary symlinked in the root of the repository.

```
ln -s ../gecko/obj-graphene/dist/Graphene.app graphene
```

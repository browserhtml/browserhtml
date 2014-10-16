/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { classes: Cc, interfaces: Ci, utils: Cu, results: Cr, manager: Cm } = Components
const ioService = Cc["@mozilla.org/network/io-service;1"].
                    getService(Ci.nsIIOService)
const resourceHandler = ioService.getProtocolHandler("resource").
                        QueryInterface(Ci.nsIResProtocolHandler)
const prefs = Cc["@mozilla.org/preferences-service;1"].
                getService(Ci.nsIPrefService).
                QueryInterface(Ci.nsIPrefBranch2)

const { XPCOMUtils } = Cu.import("resource://gre/modules/XPCOMUtils.jsm", {})
const { Services } = Cu.import("resource://gre/modules/Services.jsm", {})
const { Loader: { Loader, Require, Module, main } } =
  Cu.import("resource://gre/modules/commonjs/toolkit/loader.js", {})


const readCMDArgs = cmdLine => {
  let count = cmdLine.length
  let args = []
  let index = 0
  while (index < count) {
    args[index] = cmdLine.getArgument(index)
    index = index + 1
  }
  return args
}

// Terrible hack to register chrome URIs but unfortunately we don't have any better option.
const registerChrome = (name, path) => {
  Cm.QueryInterface(Ci.nsIComponentRegistrar);
  const { FileUtils } = Cu.import("resource://gre/modules/FileUtils.jsm", {})
  const file = FileUtils.getFile("TmpD", [`${name}.manifest`], true)
  const stream = FileUtils.openAtomicFileOutputStream(file)
  const converter = Cc["@mozilla.org/intl/converter-output-stream;1"].
                      createInstance(Ci.nsIConverterOutputStream)

  converter.init(stream, "UTF-8", 0, 0)
  converter.writeString(`content ${name} ${path}\n`)
  FileUtils.closeAtomicFileOutputStream(stream)

  dump(`register chrome: content ${name} ${path}\n`)
  Cm.autoRegister(file)
}

// Utility function that synchronously reads local resource from the given
// `uri` and returns content string.
const readURI = (uri, charset="UTF-8") => {
  const channel = ioService.newChannel(uri, charset, null)
  const stream = channel.open()
  const converter = Cc["@mozilla.org/intl/converter-input-stream;1"].
                      createInstance(Ci.nsIConverterInputStream)
  converter.init(stream, charset, 0, 0)
  let buffer = {}
  let content = ""
  let read = 0
  do {
    read = converter.readString(0xffffffff, buffer);
    content = content + buffer.value;
  } while (read != 0)
  converter.close()
  return content
}


const setPrefs = (settings, root, branch) =>
  void Object.keys(settings).forEach(id => {
    const key = root ? `${root}.${id}` : id
    const value = settings[id]
    const type = typeof(value)
    value === null ? void(0) :
    value === undefined ? void(0) :
    type === "boolean" ? branch.setBoolPref(key, value) :
    type === "string" ? branch.setCharPref(key, value) :
    type === "number" ? branch.setIntPref(key, parseInt(value)) :
    type === "object" ? setPrefs(value, key, branch) :
    void(0)
  })

const onDocumentInserted = (launchURI, resolve) => {
  const observerService = Cc["@mozilla.org/observer-service;1"]
                            .getService(Ci.nsIObserverService)
  observerService.addObserver({
    observe: function(subject, topic) {
      if (subject.URL === launchURI) {
        dump(`${subject.location.href} === ${launchURI}\n`)
        //observerService.removeObserver(this, topic)
        resolve(subject.defaultView)
      }
    }
  }, "document-element-inserted", false)
}

const launch = (root, args) => {
  const manifest = JSON.parse(readURI(`${root}/package.json`))
  const name = manifest.name
  const baseURI = `resource://${name}/`
  dump(`baseURI: ${baseURI}\n`)

  const launchPath = manifest.launchPath || "index.html"
  const launchURI = `${baseURI}${launchPath.replace("./", "")}`
  dump(`launchURI: ${launchURI}\n`)
  const mainPath = manifest.main || "index.js"
  const mainURI = `${baseURI}${mainPath.replace("./", "")}`
  dump(`mainURI: ${mainURI}\n`)


  const chromeURI = `chrome://${name}/content`
  registerChrome(name, `${root}`)

  dump(`chromeURI: ${chromeURI}\n`)
  resourceHandler.setSubstitution(name, ioService.newURI(chromeURI, null, null))

  const branch = prefs.getDefaultBranch("")
  setPrefs({
    "browser.hiddenWindowChromeURL": "chrome://firebox/content/hidden-window.xul",
    // pref needs to point to main window otherwise window.open will be broken.
    "browser.chromeURL": launchURI
  }, null, branch)

  if (manifest.preferences) {
    setPrefs(manifest.preferences, null, prefs.getDefaultBranch(""))
  }

  const window = Services.ww.openWindow(null,
                                        launchURI,
                                        "_blank",
                                        "chrome,dialog=no,resizable,scrollbars,centerscreen",
                                        null);

  if (args.indexOf("-debugger") >= 0) {
    setPrefs({
      "devtools.debugger": {
        "remote-enabled": true,
        "force-local": true,
        "prompt-connection": false
      }
    }, null, branch)
    const port = parseInt(args[args.indexOf("-debugger") + 1])
    startDebugger(port)
  }


  onDocumentInserted(launchURI, window => {
    const loader = Loader({
      id: name,
      name: name,
      isNative: true,
      rootURI: baseURI,
      metadata: manifest,
      paths: {
        "": baseURI,
        "sdk/": "resource://gre/modules/commonjs/sdk/",
        "toolkit/": "resource://gre/modules/commonjs/toolkit/",
        "diffpatcher/": "resource://gre/modules/commonjs/diffpatcher/",
        "dev/": "resource://gre/modules/commonjs/dev/",
        "method/": "resource://gre/modules/commonjs/method/",
        "devtools/": "resource://gre/modules/devtools/"
      },
      globals: {
        // Mimic window environment to avoid breaking front-end libraries that
        // would have otherwise worked.
        get window() {
          return window
        },
        get document() {
          return window.document
        },
        get navigator() {
          return window.navigator
        },
        get console() {
          return window.console
        },
        // Mimic nodejs to avoid breaking npm published modules that would
        // have worked otherwise.
        process: {
          argv: args.slice(0),
          get env() {
            Object.defineProperty(this, "env", {
              value: window.require("sdk/system/environment").env
            })
            return this.env
          }
        }
      }
    })

    const mainModule = Module(mainPath, mainURI)
    window.require = Require(loader, mainModule)
  })
}

const startDebugger = port => {
  const { DebuggerServer } =  Cu.import("resource://gre/modules/devtools/dbg-server.jsm", {})
  DebuggerServer.init()
  DebuggerServer.addBrowserActors("")
  DebuggerServer.addActors("chrome://firebox/content/actors.js")
  DebuggerServer.openListener(port)
}

const addBrowserManifst = () => {
  const file = Cc["@mozilla.org/file/directory_service;1"]
                .getService(Ci.nsIProperties)
                .get("GreD", Ci.nsIFile)

  file.append("browser")
  file.append("chrome.manifest")


  dump(`Register manifest at ${file.path}\n`)
  Cm.QueryInterface(Ci.nsIComponentRegistrar)
    .autoRegister(file)
}

const CommandLineHandler = function() {}
CommandLineHandler.prototype = {
  constructor: CommandLineHandler,
  classID: Components.ID("{5d8dfc0f-6c5e-2e4a-aa60-0fb8d3f51446}"),
  QueryInterface: XPCOMUtils.generateQI([Ci.nsICommandLineHandler]),
  helpInfo : "/path/to/firefox -app /path/to/fierbox /path/to/app-package",
  handle: cmdLine => {
    addBrowserManifst()

    const args = readCMDArgs(cmdLine)
    const rootURI = cmdLine.resolveURI(args[0]).spec
    dump(`root: ${rootURI}\n`)

    const root = rootURI.charAt(rootURI.length - 1) !== "/" ? `${rootURI}/` : rootURI
    launch(root, args)
  }
}

const components = [CommandLineHandler];
const NSGetFactory = XPCOMUtils.generateNSGetFactory(components);

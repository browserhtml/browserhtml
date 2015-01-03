/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { classes: Cc, interfaces: Ci, utils: Cu, results: Cr, manager: Cm } = Components;
const { require } = Cu.import("resource://gre/modules/commonjs/toolkit/require.js", {});

const ioService = Cc["@mozilla.org/network/io-service;1"].
                    getService(Ci.nsIIOService);
const resourceHandler = ioService.getProtocolHandler("resource").
                        QueryInterface(Ci.nsIResProtocolHandler);
const branch = Cc["@mozilla.org/preferences-service;1"].
                  getService(Ci.nsIPrefService).
                  QueryInterface(Ci.nsIPrefBranch2).
                  getDefaultBranch("");
const uuid = Cc["@mozilla.org/uuid-generator;1"].
              getService(Ci.nsIUUIDGenerator);
const AppsService = Cc["@mozilla.org/AppsService;1"].
                      getService(Ci.nsIAppsService);


const { XPCOMUtils } = require("resource://gre/modules/XPCOMUtils.jsm");
const { Services } = require("resource://gre/modules/Services.jsm");
const { DOMApplicationRegistry } = require("resource://gre/modules/Webapps.jsm");
const { SubstitutionProtocol } = require("resource://firebox/substitution-protocol.jsm");
const { Task } = require("resource://gre/modules/Task.jsm");
const appProtocol = new SubstitutionProtocol("app");
appProtocol.register();

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

const onDocumentInserted = (window, resolve) => {
  const observerService = Cc["@mozilla.org/observer-service;1"]
                            .getService(Ci.nsIObserverService)
  observerService.addObserver({
    observe: function(subject, topic) {
      if (subject.defaultView === window) {
        //observerService.removeObserver(this, topic)
        resolve(subject)
      }
    }
  }, "chrome-document-interactive", false)
}

const baseURI = Symbol("baseURI");
const manifestURI = Symbol("manifestURI");

const makeID = () => uuid.generateUUID().toString().replace(/{|}/g, "");

const makeApp = (uri, manifest) => {
  const fileName = uri.substr(uri.lastIndexOf("/") + 1);
  const rootURI = uri.substr(0, uri.lastIndexOf("/") + 1);

  const origin = manifest.origin || `app://${makeID()}`;
  const id = origin.replace(/^\S+\:\/\//, "");
  const localId = id in DOMApplicationRegistry.webapps ?
                  DOMApplicationRegistry.webapps[id].localId :
                  DOMApplicationRegistry._nextLocalId();

  return {id, localId, origin,
          installOrigin: origin,
          removable: false,
          basePath: DOMApplicationRegistry.getWebAppsBasePath(),
          manifestURL: `${origin}/${fileName}`,
          appStatus: Ci.nsIPrincipal.APP_STATUS_CERTIFIED,
          receipts: null,
          kind: DOMApplicationRegistry.kPackaged,

          [manifestURI]: uri,
          [baseURI]: rootURI}
}

const installZip = (app) => {
  let sourceDir = Cc["@mozilla.org/network/protocol;1?name=file"].
                  createInstance(Ci.nsIFileProtocolHandler).
                  getFileFromURLSpec(app[baseURI]);
  let installDir = DOMApplicationRegistry._getAppDir(app.id);


  let manifest = Cc["@mozilla.org/network/protocol;1?name=file"].
                  createInstance(Ci.nsIFileProtocolHandler).
                  getFileFromURLSpec(app[manifestURI]);
  manifest.copyTo(installDir, "");

  return;

  let zipWriter = Cc["@mozilla.org/zipwriter;1"].
                    createInstance(Ci.nsIZipWriter);

  let zipFile = installDir.clone();
  zipFile.append("application.zip");
  const PR_USEC_PER_MSEC = 1000;
  const PR_RDWR = 0x04;
  const PR_CREATE_FILE = 0x08;
  const PR_TRUNCATE = 0x20;

  dump("installDir: " + zipFile.path + "\n");
  zipWriter.open(zipFile, PR_RDWR | PR_CREATE_FILE | PR_TRUNCATE);


  const addDirToZip = (dir, basePath) => {
    let files = dir.directoryEntries;
    while (files.hasMoreElements()) {
      let file = files.getNext().QueryInterface(Ci.nsIFile);
      if (file.isHidden() || file.isSpecial() || file.equals(zipWriter.file)) {
        continue;
      }

      dump("Adding: " + basePath + file.leafName + "\n");
      if (file.isDirectory()) {
        zipWriter.addEntryDirectory(basePath + file.leafName + "/",
                                    file.lastModifiedTime * PR_USEC_PER_MSEC,
                                    true);
        addDirToZip(file, basePath + file.leafName + "/");
      } else {
        zipWriter.addEntryFile(basePath + file.leafName,
                               Ci.nsIZipWriter.COMPRESSION_DEFAULT,
                               file,
                               true);
      }
    }
  }


  addDirToZip(sourceDir, "");

  return new Promise((resolve, reject) => {
    zipWriter.processQueue({
      onStartRequest(request, context) {},
      onStopRequest(request, context, status) {
        if (status == Cr.NS_OK) {
          zipWriter.close();
          resolve();
        }
        else {
          let { name, message } = getResultText(status);
          reject(name + ": " + message);
        }
      }
    }, null);
  });
}

const installApp = app => {
  appProtocol.setSubstitution(app.id, ioService.newURI(app[baseURI], null, null));

  const install = Object.assign({}, app,
                                {installTime: Date.now(),
                                installState: "installed"});



  setPrefs({
    "security.apps.certified.CSP.default": `default-src *; script-src 'self'; object-src 'none'; style-src 'self' 'unsafe-inline' ${app.origin}`,
    "network.dns.localDomains": app.origin
  }, null, branch)

  DOMApplicationRegistry.webapps[install.id] = install;
  DOMApplicationRegistry.updatePermissionsForApp(install.id);

  // Fake first run, which will trigger re-installation of the app.
  branch.clearUserPref("gecko.mstone");
}

const launch = (manifestURI, args) => Task.spawn(function*() {
  const {preferences} = JSON.parse(readURI("resource://firebox/package.json"));
  setPrefs(preferences, null, branch);

  const manifest = JSON.parse(readURI(manifestURI));
  const app = makeApp(manifestURI, manifest);
  const launchURI = `${app.origin}${manifest.launch_path}`;
  const window = Services.ww.openWindow(null,
                                        "chrome://firebox/content/shell.xul",
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


  onDocumentInserted(window, document => {
    dump("document ready")
    const root = document.documentElement;
    const { appVersion } = window.navigator;
    const os = appVersion.contains('Win') ? "windows" :
               appVersion.contains("Mac") ? "osx" :
               appVersion.contains("X11") ? "linux" :
               "Unknown";


    root.setAttribute("os", os);
    root.setAttribute("draw-in-titlebar", true);
    root.setAttribute("chromemargin", os == "windows" ?
                                      "0,2,2,2" :
                                      "0,-1,-1,-1");

    const content = document.getElementById("content");
    const docShell = content.
                      contentWindow.
                      QueryInterface(Ci.nsIInterfaceRequestor).
                      getInterface(Ci.nsIWebNavigation).
                      QueryInterface(Ci.nsIDocShell);

    dump(`set frame to be an app: ${app.localId}\n`);
    docShell.setIsApp(app.localId);
    content.setAttribute("src", launchURI);
  });

  yield DOMApplicationRegistry.registryReady;
  yield installZip(app);
  installApp(app);
});

const startDebugger = port => {
  const { DebuggerServer } =  Cu.import("resource://gre/modules/devtools/dbg-server.jsm", {})
  DebuggerServer.init()
  DebuggerServer.addBrowserActors("")
  DebuggerServer.addActors("chrome://firebox/content/actors.js")

  const listener = DebuggerServer.createListener();
  listener.portOrPath = port;
  listener.open();
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
    launch(rootURI, args)
  }
}

const components = [CommandLineHandler];
const NSGetFactory = XPCOMUtils.generateNSGetFactory(components);

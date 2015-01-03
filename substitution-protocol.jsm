"use strict";

const EXPORTED_SYMBOLS = ["SubstitutionProtocol"];

const { utils: Cu, classes: Cc, interfaces: Ci, manager: Cm,
       results: Cr } = Components;
Cm.QueryInterface(Ci.nsIComponentRegistrar);

const io = Cc["@mozilla.org/network/io-service;1"]
            .getService(Ci.nsIIOService);
const branch = Cc["@mozilla.org/preferences-service;1"].
                getService(Ci.nsIPrefService).
                QueryInterface(Ci.nsIPrefBranch2).
                getBranch("network.protocol.substitutions.");
const childBus = Cc["@mozilla.org/childprocessmessagemanager;1"].
                  getService(Ci.nsISyncMessageSender);
const parentBus = Cc["@mozilla.org/parentprocessmessagemanager;1"].
                    getService(Ci.nsIMessageBroadcaster);
const runtime = Cc["@mozilla.org/xre/app-info;1"].
                 getService(Ci.nsIXULRuntime);
const uuid = Cc["@mozilla.org/uuid-generator;1"].
              getService(Ci.nsIUUIDGenerator);

const securityManager = Cc["@mozilla.org/scriptsecuritymanager;1"].
                          getService(Ci.nsIScriptSecurityManager);


const isParentProcess = runtime.processType == runtime.PROCESS_TYPE_DEFAULT;

const SubstitutionProtocol = function(scheme, classID=uuid.generateUUID()) {
  this.scheme = scheme;
  this.contract = `@mozilla.org/network/protocol;1?name=${scheme}`;
  this.classID = classID;
}
SubstitutionProtocol.prototype = {
  constructor: SubstitutionProtocol,
  description: "Custom substitution protocol implemantion",
  QueryInterface(iid) {
    if (iid.equals(Ci.nsISupports) ||
        iid.equals(Ci.nsIProtocolHandler) ||
        iid.equals(Ci.nsIResProtocolHandler) ||
        iid.equals(Ci.nsIFactory))
    {
      return this
    }

    throw Cr.NS_ERROR_NO_INTERFACE
  },

  // nsIResProtocolHandler
  getSubstitution(host) {
    if (!this.hasSubstitution(host)) {
      throw Cr.NS_ERROR_NOT_AVAILABLE;
    }

    return io.newURI(branch.getCharPref(`${this.scheme}.${host}`),
                     null, null);
  },
  hasSubstitution(host) {
    return branch.prefHasUserValue(`${this.scheme}.${host}`);
  },
  setSubstitution(host, uri) {
    if (uri) {
      branch.setCharPref(`${this.scheme}.${host}`, uri.spec);
    } else {
      branch.clearUserPref(`${this.scheme}.${host}`);
    }
  },
  resolveURI({host, path}) {
    let uri = this.getSubstitution(host);
    if (!uri) {
      throw Cr.NS_ERROR_NOT_AVAILABLE;
    }
    return uri.resolve(path.substr(1));
  },

  // nsIProtocolHandler
  defaultPort: -1,
  protocolFlags: Ci.nsIProtocolHandler.URI_NOAUTH |
                 Ci.nsIProtocolHandler.URI_DANGEROUS_TO_LOAD |
                 Ci.nsIProtocolHandler.URI_IS_UI_RESOURCE |
                 Ci.nsIProtocolHandler.URI_CROSS_ORIGIN_NEEDS_WEBAPPS_PERM,
  scheme: null,
  newURI(spec, originCharset, baseURI) {
    let uri = Cc["@mozilla.org/network/standard-url;1"]
               .createInstance(Ci.nsIStandardURL)
    uri.init(Ci.nsIStandardURL.URLTYPE_STANDARD,
             -1, spec, originCharset, baseURI)
    return uri.QueryInterface(Ci.nsIURI)
  },

  newChannel(uri) {
    let channel = io.newChannel(this.resolveURI(uri), null, null);
    channel.QueryInterface(Ci.nsIChannel).originalURI = uri;
//    channel.owner = securityManager.getSimpleCodebasePrincipal(this.newURI(`${uri.scheme}://${uri.host}`, null, null));
    return channel;
  },

  // nsIFactory
  createInstance(outer, iid) {
   if (outer) {
     throw Cr.NS_ERROR_NO_AGGREGATION;
   }
   return this
  },
  lockFactory: function(aLock) {
    throw Cr.NS_ERROR_NOT_IMPLEMENTED;
  },
  // component
  register() {
    Cm.registerFactory(this.classID,
                       this.description,
                       this.contract,
                       this);

    if (isParentProcess) {
      parentBus.broadcastAsyncMessage("network/protocol/substitution/register",
                                      this.toJSON());
    }
  },
  unregister() {
    branch.deleteBranch(this.scheme);
    Cm.unregisterFactory(this.classID, this);

    if (isParentProcess) {
      parentBus.broadcastAsyncMessage("network/protocol/substitution/unregister",
                                      this.toJSON());
    }
  },
  toJSON() {
    return {
      scheme: this.scheme,
      contract: this.contract,
      classID: this.classID.toString()
    }
  }
}

// E10S Propagation.


if (runtime.processType == runtime.PROCESS_TYPE_DEFAULT) {
  Cc["@mozilla.org/globalmessagemanager;1"].
    getService(Ci.nsIMessageListenerManager).
    loadFrameScript(`data:,Components.utils.import("${__URI__}", {})`, true);
} else {
  childBus.addMessageListener("network/protocol/substitution/register", ({data}) => {
    new SubstitutionProtocol(data.scheme, Components.ID(data.classID)).register();
  });
  childBus.addMessageListener("network/protocol/substitution/unregister", ({data}) => {
    let factory = Cm.getClassObjectByContractID(data.contract,
                                                Ci.nsIFactory,
                                                {});
    Cm.unregisterFactory(Components.ID(data.classID), factory);
  });
}

function Tab() {
  let hbox = document.createElement("hbox");
  hbox.className = "tab";
  hbox.setAttribute("align", "center");

  let throbber = document.createElement("div");
  throbber.className = "throbber";

  let favicon = document.createElement("img");
  favicon.className = "favicon";

  let title = document.createElement("hbox");
  title.className = "title";

  let button = document.createElement("button");
  button.className = "close-button";

  hbox.appendChild(throbber);
  hbox.appendChild(favicon);
  hbox.appendChild(title);
  hbox.appendChild(button);

  this._dom = hbox;

  let iframe = document.createElement("iframe");
  iframe.setAttribute("mozbrowser", "true");
  iframe.setAttribute("flex", "1");
  iframe.setAttribute("remote", "true");
  this._iframe = iframe;

  this._trackIframe();
}

Tab.prototype = {

  get iframe() {
    return this._iframe;
  },

  get dom() {
    return this._dom;
  },

  destroy: function() {
    this.dom.remove();
    this.iframe.remove();
    this._selected = false;
  },

  isSelected: function() {
    return this._selected;
  },

  select: function() {
    this.iframe.show();
    this.iframe.focus();
    this.dom.classList.add("selected");
    this._selected = true;
  },

  unselect: function() {
    this.iframe.hide();
    this.dom.classList.remove("selected");
    this._selected = false;
  },

  _trackIframe: function() {
    let events = ["mozbrowserasyncscroll", "mozbrowserclose", "mozbrowsercontextmenu",
                  "mozbrowsererror", "mozbrowsericonchange", "mozbrowserloadend",
                  "mozbrowserloadstart", "mozbrowserlocationchange", "mozbrowseropenwindow",
                  "mozbrowsersecuritychange", "mozbrowsershowmodalprompt", "mozbrowsertitlechange",
                  "mozbrowserusernameandpasswordrequired"];
    for (let eventName of events) {
      this.iframe.addEventListener(eventName, this);
    }
  },

  get loading() { return this._loading },
  get title() { return this._title},
  get location() { return this._location},
  get favicon() { return this._favicon},

  updateDom: function() {
    if (this.loading) {
      this.dom.classList.add("loading");
    } else {
      this.dom.classList.remove("loading");
    }
    this.dom.querySelector(".title").textContent = this.title;
    let faviconImg = this.dom.querySelector(".favicon");
    if (this.favicon) {
      faviconImg.src = this.favicon;
    } else {
      faviconImg.removeAttribute("src");
    }
  },

  _loading: true,
  _title: "",
  _location: "",
  _favicon: "",
  handleEvent: function(e) {
    let somethingChanged = true;
    switch(e.type) {
      case "mozbrowserloadstart":
        this._loading = true;
        break;
      case "mozbrowserloadend":
        this._loading = false;
        break;
      case "mozbrowsertitlechange":
        this._title = e.detail;
        break;
      case "mozbrowserlocationchange":
        this._favicon = "";
        this._location = e.detail;
        break;
      case "mozbrowsericonchange":
        this._favicon = e.detail.href;
        break;
      case "mozbrowsererror":
        this._loading = false;
        break;
      default:
        somethingChanged = false;
    }
    if (somethingChanged) {
      this.updateDom();
      if (this.isSelected) {
        gBrowser.selectedTabHasChanged();
      }
    }
  },
}

console.log("start");

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
define((require, exports, module) => {
  'use strict';

  const PouchDB = require('pouchdb');
  const {spawn, async} = require('lang/task');
  const {Record, List, Maybe, Any, Union} = require('typed-immutable/index');

  // PouchDB has a sepcial field `_id` for identifing records
  // and `_rev` for identifiying revisitions. We will refer to
  // those properties as `[PouchDB.id]` & `[PouchDB.revision]`
  // instead.
  PouchDB.id = "_id";
  PouchDB.revision = "_rev";


  // Type aliases that may be enhanced further sometime later.
  const ID = String
  const Revision = String;
  const TimeStamp = Number;
  const Type = String;
  const URI = String;
  const TagName = String;
  const Blob = Any;


  // Helper function to convert string to a ArrayBuffer instance.
  const stringToBuffer = string => new TextEncoder().encode(string);
  // Helper function to create cryptographic hash of the content.
  const sha = string => crypto.subtle.digest("SHA-256",
                                             stringToBuffer(string)).then(btoa);

  const stub = record => record.constructor.Stub(record);
  const hash = record => record.constructor.hash(record);

  const write = (record, db, config) => {
    return db.put(record.toJSON());
  };

  const read = async(function*(record, db, config) {
    try {
      const data = yield db.get(record[PouchDB.id]);
      return new record.constructor(data);
    } catch (error) {
      if (error.status != 404) {
        throw error
      }
      return record;
    }
  });

  const edit = async(function*(record, transform, db, config) {
    const current = yield read(record, db);
    const next = yield transform(current);
    return write(next, db, config);
  });

  const push = x => xs => xs.push(x);
  const remove = x => xs => xs.remove(x);

  const exclude = x => xs => {
    const index = xs.indexOf(x)
    return index < 0 ? xs :
           index == 0 ? xs.rest() :
           index + 1 == xs.size ? xs.butLast() :
           xs.take(index).concat(xs.skip(index + 1))
  }
  const include = x => xs => xs.indexOf(x) < 0 ? xs.push(x) : xs


  /*
  ## Interests API

  ### Sites

  Sites store contains records of sites that have being visited by a user.
  Sites store contains records of the following schema (which could be extended
  in the future).

  {
    _id: "site/http://learnyouahaskell.com/introduction#about-this-tutorial",
    uri: "http://learnyouahaskell.com/introduction#about-this-tutorial",
    title: "Introduction - Learn You a Haskell for Great Good!",
    backgroundColor: "rgb(255, 255, 255)",
    visits: [
      {
        start: 1421434329682266,
        end: 1421434484899,
        device: "Desktop"
      }
    ],
    tags: [
      "haskell",
      "functional"
    ]
  }
  */

  const Visit = Record({
    type: Type('Visit'),
    start: TimeStamp,
    end: Maybe(TimeStamp),
    id: String, // This is a web view ID in our case.
    device: String('Desktop'),
  });

  const Site = Record({
    [PouchDB.id]: ID,
    [PouchDB.revision]: Maybe(Revision),
    type: Type('Site'),
    uri: URI,
    title: Maybe(String),
    visits: List(Visit),
    tags: List(TagName),
    icon: Maybe(URI), // Would be better if it was Blob as well.
    image: Blob,
  });
  Site.storeID = 'sites';
  Site.frequency = ({visits}) => visits.size;
  Site.from = ({uri, title}) => Site({[PouchDB.id]: `site/${uri}`, uri, title});

  Site.beginVisit = ({time, id, device}) => site =>
    site.update('visits', push(Visit({start: time, id, device})));


  Site.endVisit = ({id, time}) => site => {
    const index = site.visits.findIndex(visit => visit.id === id);
    return index < 0 ? site : site.setIn(['visits', index, 'end'], time);
  };


/**

### Quotes

Quotes store contains records of quotes that have being created by a user that
have a following structure.


{
  _id: "quote/W29iamVjdCBBcnJheUJ1ZmZlcl0=",
  content: `If you say that <span class="fixed">a</span> is 5, you can't say it's something else later because you just said it was 5. What are you, some kind of liar? So in purely functional languages, a function has no side-effects. The only thing a function can do is calculate something and return it as a result.`
  uri: "http://learnyouahaskell.com/introduction#about-this-tutorial",
  tags: ["functional"]
}
**/

  const Quote = Record({
    [PouchDB.id]: ID,
    [PouchDB.revision]: Maybe(Revision),

    type: Type('Quote'),
    uri: URI,
    content: String,
    tags: List(TagName)
  });
  Quote.storeID = 'quotes';

  Quote.construct = async(function* ({uri, content}) {
    const hash = yield sha(content);
    return Quote({[PouchDB.id]: `quote/${uri}/${hash}`, uri, content});
  });


  /**
  {
    _id: "tag/haskell",
    description: "Haskell programming language",
    name: "haskell",
    items: [
      "quote/W29iamVjdCBBcnJheUJ1ZmZlcl0="
      "site/http://learnyouahaskell.com"
    ]
  }
  **/

  const Tag = Record({
    [PouchDB.id]: ID,
    [PouchDB._rev]: Maybe(Revision),
    type: Type("Tag"),
    name: TagName,
    items: List(ID)
  });
  Tag.storeID = 'tags';

  Tag.add = (tag, item) =>
    tag.update('items', include(item[PouchDB.id]));

  Tag.remove = (tag, item) =>
    tag.update('items', exclude(item[PouchDB.id]));

  Tag.tag = (item, tagName) => item.update('tags', include(tagName));

  Tag.untag = (item, tagName) => item.update('tags', exclude(tagName));

  const Top = Record({
    [PouchDB.id]: ID('top/sites'),
    [PouchDB.revision]: Maybe(Revision),
    sites: List(Site)
  });
  Top.storeID = Site.storeID;
  Top.sample = (site, limit) => top => top.update('sites', sites => {
    const index = sites.findIndex(x => x[PouchDB.id] === site[PouchDB.id])
    return sites.set(index < 0 ? sites.size : index, site)
                .sortBy(Site.frequency)
                .take(limit);
  });

  const clear = async(function*({stores}) {
    yield stores.sites.destroy();
    yield stores.quotes.destroy();
    yield stores.tags.destroy();
  });

  let taskID = 0;

  const scheduleEdit = async(function*(history, record, transform) {
    try {
      // wait for last scehduled edit to complete.
      yield history.editQueue[record[PouchDB.id]];
    } catch (error) {
      // If last operation faild log an error, but proceed to a next
      // operation.
      console.error(error);
    } finally {
      const store = history.stores[record.constructor.storeID];
      return edit(record, transform, store);
    }
  })

  // History
  class History {
    static defaults() {
      return {
        sitesStoreName: "sites",
        quotesStoreName: "quotes",
        tagsStoreName: "tags",
        topSiteLimit: 6,
      }
    }
    constructor(options={}) {
      this.onSiteChange = this.onSiteChange.bind(this);
      this.onTopSitesChange = this.onTopSitesChange.bind(this);

      this.options = Object.assign(History.defaults(), options);
      const {sitesStore, quotesStore, tagsStore,
             sitesStoreName, quotesStoreName, tagsStoreName} = this.options;

      this.stores = {
        sites: sitesStore || new PouchDB(sitesStoreName),
        quotes: quotesStore || new PouchDB(quotesStoreName),
        tags: tagsStore || new PouchDB(tagsStoreName)
      }

      this.editQueue = Object.create(null);

      this.setupChangeFeeds();
      this.setupListeners();
    }
    setupChangeFeeds() {
      const {sites} = this.stores

      this.topSiteChangeFeed = sites.changes({
        since: "now",
        live: true,
        include_docs: true,
        doc_ids: ["top/sites"]
      });

      this.sitesChangeFeed = sites.changes({
        since: "now",
        live: true,
        filter: ({[PouchDB.id]: id}) => id.startsWith("site/"),
        include_docs: true
      });
    }
    setupListeners() {
      this.topSiteChangeFeed.on("change", this.onTopSitesChange);
      this.sitesChangeFeed.on("change", this.onSiteChange);
    }

    // Edits per record are queued, to avoid data loss
    // due to concurrent edits.
    edit(record, transform) {
      const id = record[PouchDB.id];
      return this.editQueue[id] = scheduleEdit(this, record, transform);
    }

    clear() {
      return clear(this);
    }

    onTopSitesChange({doc}) {
      const top = Top(doc);
      this.options.topSites = top;
      if (this.options.onTopSitesChange) {
        this.options.onTopSitesChange(top);
      }
    }
    onSiteChange({doc}) {
      const site = Site(doc);
      this.edit(Top({[PouchDB.id]: "top/sites"}),
                Top.sample(site, this.options.topSiteLimit));

      if (this.options.onSiteChange) {
        this.options.onSiteChange(site);
      }
    }
  };

  exports.History = History;
  exports.Site = Site;
  exports.Tag = Tag;
  exports.Top = Top;
  exports.Quote = Quote;
});

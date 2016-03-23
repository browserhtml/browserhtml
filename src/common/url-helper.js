/* @flow */

/* this source code form is subject to the terms of the mozilla public
 * license, v. 2.0. if a copy of the mpl was not distributed with this
 * file, you can obtain one at http://mozilla.org/mpl/2.0/. */

/*::
import type {URI, URL} from "./url-helper"
*/

// @TODO:
// Properly define interface off all functions as some assume that
// hostname and protocol and pathname are always strings while others
// assume they cane be null.

const nullURL =
  { origin: null
  , hostname: null
  , protocol: null
  , pathname: null
}

export const parse = (input/*:string*/)/*:URL*/ => {
  try {
    return new window.URL(input);
  } catch(_) {
    return nullURL;
  }
}

export const hasScheme =
  (input/*:URI*/)/*:boolean*/ =>
  !!(rscheme.exec(input) || [])[0];

export const getOrigin =
  (url/*:URI*/)/*:?string*/ =>
  parse(url).origin;

export const getBaseURI =
  ()/*:URL*/ =>
  new window.URL('./', location);

export const getHostname =
  (url/*:URI*/)/*:?string*/ =>
  parse(url).hostname;

export const getDomainName =
  (url/*:URI*/)/*:string*/ =>
  (getHostname(url) || '').replace(/^www\./, '');

export const getProtocol =
  (url/*:URI*/)/*:?string*/ =>
  parse(url).protocol;

export const getManifestURL =
  ()/*:URL*/ =>
  new window.URL('./manifest.webapp', getBaseURI());

export const getPathname =
  (input/*:URI*/)/*:?string*/ =>
  parse(input).pathname;


const isHttpOrHttps = (url) => {
  const {protocol} = parse(url);
  return (protocol === 'http:' || protocol === 'https:');
}

export const isAboutURL =
  (url/*:URI*/)/*:boolean*/ =>
  parse(url).protocol === 'about:';

export const isPrivileged = (uri/*:URI*/)/*:boolean*/ => {
  // FIXME: not safe. White list?
  return uri.startsWith(new window.URL('./components/about/', getBaseURI()));
};

const rscheme = /^(?:[a-z\u00a1-\uffff0-9-+]+)(?::|:\/\/)/i;

export const isNotURL = (input/*:string*/)/*:boolean*/ => {
  var str = input.trim();

  // for cases, ?abc and 'a? b' which should searching query
  const case1Reg = /^(\?)|(\?.+\s)/;
  // for cases, pure string
  const case2Reg = /[\?\.\s\:]/;
  // for cases, data:uri
  const case3Reg = /^\w+\:\/*$/;
  if (str == 'localhost') {
    return false;
  }
  if (case1Reg.test(str) || !case2Reg.test(str) || case3Reg.test(str)) {
    return true;
  }
  if (!hasScheme(input)) {
    str = 'http://' + str;
  }
  try {
    new window.URL(str);
    return false;
  } catch (e) {
    return true;
  }
}

const readSearchURL = input =>
  `https://duckduckgo.com/?q=${encodeURIComponent(input)}`;

const readAboutURL = input =>
  input === 'about:blank' ? input :
  `${getBaseURI()}components/about/${input.replace('about:', '')}/index.html`;

export const read = (input/*:string*/)/*:URI*/ =>
  isNotURL(input) ? readSearchURL(input) :
  !hasScheme(input) ? `http://${input}` :
  isAboutURL(input) ? readAboutURL(input) :
  input;

export const normalize = (uri/*:URI*/)/*:URI*/ =>
  isAboutURL(uri) ? readAboutURL(uri) :
  uri;

export const resolve = (from/*:URI*/, to/*:URI*/)/*:URI*/ =>
  new window.URL(to, from).href;

const aboutPattern = /\/about\/([^\/]+)\/index.html$/;

const readAboutTerm = input => {
  const match = aboutPattern.exec(input);
  return match != null ? match[1] : null;
}

export const asAboutURI = (uri/*:URI*/)/*:?URI*/ => {
  const base = getBaseURI();
  const {origin, pathname} = new window.URI(uri);
  const about = base.origin === origin ? readAboutTerm(pathname) : null;
  return about != null ? `about:${about}` : null;
}

// Prettify a URL for display purposes. Will minimize the amount of URL cruft.
export const prettify = (input/*:URI*/)/*:string*/ =>
  // Don't mess with non-urls.
  ( isNotURL(input)
  ? input
  // Don't mess with `about:`, `data:`, etc.
  : !isHttpOrHttps(input)
  ? input
  // If there's a meaningful pathname, keep it.
  : getPathname(input) !== '/'
  ? `${getHostname(input)}${getPathname(input)}`
  // Otherwise, just show the hostname
  : `${getHostname(input)}`
  );

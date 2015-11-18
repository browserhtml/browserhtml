// @TODO write type signatures

/* this source code form is subject to the terms of the mozilla public
 * license, v. 2.0. if a copy of the mpl was not distributed with this
 * file, you can obtain one at http://mozilla.org/mpl/2.0/. */

const nullURL = {
  origin: null,
  hostname: null,
  protocol: null
}

export const parse = input => {
  try {
    return new URL(input);
  } catch(_) {
    return nullURL;
  }
}

export const hasScheme = input => !!(rscheme.exec(input) || [])[0];
export const getOrigin = url => parse(url).origin;
export const getBaseURI = () => new URL('./', location);
export const getHostname = url => parse(url).hostname;
export const getDomainName = url =>
  (getHostname(url) || '').replace(/^www\./, '');
export const getProtocol = url => parse(url).protocol;
export const getManifestURL = () => new URL('./manifest.webapp', getBaseURI());
export const getPathname = input => parse(input).pathname;

export const isAboutURL = url =>
  parse(url).protocol === 'about:';

export const isPrivileged = uri => {
  // FIXME: not safe. White list?
  return uri && uri.startsWith(new URL('./src/about/', getBaseURI()));
};

const rscheme = /^(?:[a-z\u00a1-\uffff0-9-+]+)(?::|:\/\/)/i;
export const isNotURL = input => {
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
    new URL(str);
    return false;
  } catch (e) {
    return true;
  }
}

const readSearchURL = input =>
  `https://duckduckgo.com/?q=${encodeURIComponent(input)}`;

const readAboutURL = input =>
  input === 'about:blank' ? input :
  `${getBaseURI()}src/about/${input.replace('about:', '')}/index.html`;

export const read = input =>
  isNotURL(input) ? readSearchURL(input) :
  !hasScheme(input) ? `http://${input}` :
  input;

export const resolve = uri =>
  isAboutURL(uri) ? readAboutURL(uri) :
  uri;

const aboutPattern = /\/about\/([^\/]+)\/index.html$/;

const readAboutTerm = input => {
  const match = aboutPattern.exec(input);
  return match != null ? match[1] : null;
}

export const asAboutURI = uri => {
  const base = getBaseURI();
  const {origin, pathname} = new URI(uri);
  const about = base.origin === origin ? readAboutTerm(pathname) : null;
  return about != null ? `about:${about}` : null;
}

// Prettify a URL for display purposes. Will minimize the amount of URL cruft.
export const prettify = (input) =>
  // Don't mess with about:x
  isAboutURL(input) ?
    input :
  // Display https, since that's relevant.
  getProtocol(input) === 'https:' ?
    input :
  // If there's a meaningful pathname, keep it.
  getPathname(input) !== '/' ?
    (getHostname(input) + getPathname(input)) :
  // Otherwise, just show the hostname
  getHostname(input);

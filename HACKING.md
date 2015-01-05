# HACKING

## Workflow

0. Run Firefox.html (see `README.md` for instructions)
1. Change code
2. No need to restart, use the Super Reload shortcut: `Ctrl/Cmd-shift-R`
3. To run the devtools, press `F12`

![No build process](https://cloud.githubusercontent.com/assets/373579/5208414/3d48ec64-75b4-11e4-942d-64e194c57b9f.gif)

## Code architecture

Entry point is `app.js`.

JS files are loaded with `require.js`.

The core of the browser is `tabiframedeck.js`. It defines a
`TabIframeDeck` object that handles an array of iframes. Iframes
are embedded into a wrapper: `<tab-iframe>` (see `tabiframe.js`).
Events are emitted when iframes are added/removed from the deck,
or when an iframe is selected. `TabIframeDeck` includes methods to
manipulate the deck (add, remove and select iframes).

Some self-contained modules listen and control to `TabIframeDeck`.
Like `tabstrip.js` and `navbar.js`.

## Modularity

We want to keep `TabIframeDeck` self-contained. If the only imported module
is `tabiframedeck.js`, Firefox.html should still work with no JS exception.
For example, the `navbar.js` modules knows nothing about the `tabstrip.js`
module, and `tabiframedeck` knows nothing about `tabstrip.js` and `navbar.js`.

## Tests

To run tests manually you need to install our dependencies _once_ after cloning the repository:

```bash
npm install
```

After installing the dependencies you can trigger the tests with the following command:

```bash
npm test
```

## Use

- [CSS variable](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables)
- [web components](http://webcomponents.org/)
- [Browser API](https://developer.mozilla.org/en-US/docs/Web/API/Using_the_Browser_API)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)
- [ES6](https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_6_support_in_Mozilla)

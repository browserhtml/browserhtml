require.config({
  scriptType: 'text/javascript;version=1.8',
  baseUrl: '../../../node_modules/',
  nodeIdCompat: true,
  paths: {
    common: '../src/common',
    lang: '../src/common/lang',
    shims: '../src/common/shims',
    react: 'react/dist/react',
    immutable: 'immutable/dist/immutable',
    omniscient: 'omniscient/dist/omniscient',
  },
  shim: {
    omniscient: {
      deps: ['shims/omniscient']
    }
  }
});

require(['../src/about/settings/index']);

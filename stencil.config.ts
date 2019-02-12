import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'pie-player',
  bundles: [ { components: [ 'pie-author' ] } ],
  outputTargets:[
    { type: 'dist' },
    { type: 'docs' },
    {
      type: 'www',
      serviceWorker: null // disable service workers
    }
  ]
};

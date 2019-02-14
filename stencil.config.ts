import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'pie-player-components',
  bundles: [ { components: [ 'pie-author','pie-player' ] } ],
  outputTargets:[
    { type: 'dist' },
    { type: 'docs' },
    {
      type: 'www',
      serviceWorker: null // disable service workers
    }
  ]
};

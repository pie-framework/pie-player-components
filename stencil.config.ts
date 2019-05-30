import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
export const config: Config = {
  namespace: 'pie-player-components',
  bundles: [
    {
      components: [
        'pie-author',
        'pie-player',
        'pie-loader',
        'pie-spinner',
        'pie-stimulus-layout',
        'pie-preview-layout',
        'pie-preview-control'
      ]
    }
  ],
  copy: [{ src: 'demo' }],
  outputTargets: [
    { type: 'dist' },
    { type: 'docs-readme' },
    {
      type: 'www',
      serviceWorker: null // disable service workers
    }
  ],
  plugins: [sass({ includePaths: ['./node_modules'] })]
};

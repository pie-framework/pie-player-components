import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
export const config: Config = {
  namespace: 'pie-player-components',
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

import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
export const config: Config = {
  namespace: 'pie-player-components',
  
  outputTargets: [
    { 
      type: 'dist' ,
      copy: [
        {
          src: 'components/pie-author/readme.md',
          dest: '../docs/pie-author.md'
        },
        {
          src: 'components/pie-player/readme.md',
          dest: '../docs/pie-player.md'
        }
      ]
    },
    { type: 'docs-readme' },
    {
      type: 'www',
      copy: [{ src: 'demo' }],
      serviceWorker: null // disable service workers
    }
  ],
  plugins: [sass({ includePaths: ['./node_modules'] })]
};

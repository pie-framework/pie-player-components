import { Config } from "@stencil/core";
import { sass } from "@stencil/sass";
export const config: Config = {
  namespace: "pie-player-components",

  outputTargets: [
    {
      type: "dist",
      copy: [
        {
          src: "components/pie-author/readme.md",
          dest: "../docs/pie-author.md"
        },
        {
          // top level in dist dir
          src: "components/pie-player/readme.md",
          // top level in dist dir
          dest: "../docs/pie-player.md"
        }
      ]
    },
    {
      type: 'docs-readme',
      footer: '',
      dir: 'docs'
    },
    {
      type: "www",
      copy: [{ src: "demo" }, { src: "ebsr.html" }],
      serviceWorker: null // disable service workers
    }
  ],
  plugins: [sass({ includePaths: ["./node_modules"] })]
};

export const emptyConfigure = (namespace: string) => {
  const RENDER_KEY = "pie.empty-configure.render";
  const out = class extends HTMLElement {
    constructor() {
      super();
      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.innerHTML = `<div class="root">
        <style>
          .header{
            color: red;
            font-style: italic;
            padding: 5px;
            border: solid 1px red;
          }
          .root{
            display: none;
          }
        </style>
        <div class="header">An empty configure element is being rendered. This loader can't find a configure definition for ${namespace}. Note: this ui will only render if localStorage['${RENDER_KEY}'] is true</div>
        <pre></pre>
      </div>`;
    }
    set model(m) {
      const renderData = localStorage.getItem(RENDER_KEY);

      if (renderData) {
        const root = this.shadowRoot.querySelector(".root");
        root.setAttribute("style", "display: block");
        const pre = this.shadowRoot.querySelector("pre");
        pre.innerHTML = JSON.stringify(m, null, "  ");
      }
    }
  };
  (out as any)._emptyConfigure = true;
  return out;
};

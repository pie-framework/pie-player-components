class DemoEl extends HTMLElement {
  connectedCallback() {
    const url = this.getAttribute("data-pivot-url");
    const w = this.getAttribute("data-width") || 600;
    const h = this.getAttribute("data-height") || 600;
    if (url) {
      this.innerHTML = `<div style="padding-top: 10px; padding-bottom:10px;">
      <iframe frameborder="0" src="${url}" width="${w}" height="${h}"></iframe>
      </div>`;
    } else {
      this.innerHTML = "?";
    }
  }
}

export const definition = () => {
  return class extends DemoEl {};
};

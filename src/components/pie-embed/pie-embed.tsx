import { Component, Element, h, Prop, State } from "@stencil/core";
import { load } from "./new-loader";

@Component({
  tag: "pie-embed",
  styleUrl: "../components.css",
  shadow: false
})
export class Embed {
  @Prop({ context: "document" }) doc!: Document;

  @State()
  tag: string;

  @State()
  params: any;

  @Element() el: HTMLElement;

  async componentWillLoad() {
    const dataset = this.el.dataset || {};
    const { tag, url } = dataset;
    if (!url) {
      return;
    }
    if (!tag) {
      return;
    }

    this.tag = tag;

    const names = this.el.getAttributeNames();
    this.params = Object.entries(names).reduce((acc, [index, n]: any[]) => {
      if (n !== "data-tag" && n !== "data-url") {
        acc[n] = this.el.getAttribute(n);
      }
      return acc;
    }, {});
    // this.params = params || {};
    await load(tag, url);
  }

  render() {
    if (this.tag) {
      const Tag = this.tag;
      return <Tag {...this.params} />;
    }
  }
}

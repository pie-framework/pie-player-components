import { Component, Method, Prop, Element } from '@stencil/core';
import {
  ItemConfig,
  PieItemElement,
  PieContent,
  AdvancedItemConfig
} from '../../interface';
import isFunction from 'lodash/isFunction';
import { getPackageWithoutVersion } from '../../utils/utils';

@Component({
  tag: 'pie-cloud-loader'
})
export class CloudLoader {
  @Prop({ context: 'document' }) doc!: Document;

  @Element() el: HTMLElement;

  @Method()
  createAuthor(config: any) {
    const authorEl = this.doc.createElement('pie-author');
    Object.assign(authorEl, { config });
    this.el.appendChild(authorEl);
    if (config.pie) {
      const ac = config as AdvancedItemConfig;
      this.loadCloudPies(ac.pie.elements, this.doc);
    } else {
      const pc = config as PieContent;
      this.loadCloudPies(pc.elements, this.doc);
    }
    
  }

  getEmptyConfigure = () =>
    class extends HTMLElement {
      set model(_) {}
    };
  /**
   *
   * @param {Object<string,string>} elements elements to load from pie cloud service
   * @param {HTMLDocument} doc - the document to load the scripts
   * @param {string} base_url - default base url for cloud service
   */
  loadCloudPies(
    elements: PieItemElement,
    doc,
    base_url = 'https://pits-dot-pie-dev-221718.appspot.com/bundles/'
  ) {
    console.log('----loadCloudPies');
    const head = doc.getElementsByTagName('head')[0];
    const keys = Object.keys(elements);

    for (const key in keys) {
      const elementName = keys[key];
      const npmPackage: string = elements[elementName];
      const packageWithoutVersion = getPackageWithoutVersion(npmPackage);
      const script = doc.createElement('script');
      const onloadFn = (_package => {
        console.log('----on load function');
        return () => {
          const packages = _package.split('+');
          const elementsName = elementName.split('+');

          packages.forEach((pack, index) => {
            const pie = window['pie'].default[pack];
            const initialEl = elementsName[index];
            const atSymbolPos = initialEl.indexOf('@');
            const elName =
              atSymbolPos >= 0 ? initialEl.slice(0, atSymbolPos) : initialEl;
            console.log('defining elements');

            if (!customElements.get(elName)) {
              customElements.define(elName, pie.Element);

              // This fixes some cases where the pie build service fails
              pie.Configure = isFunction(pie.Configure)
                ? pie.Configure
                : this.getEmptyConfigure();

              customElements.define(elName + '-config', pie.Configure);
            }
          });
        };
      })(packageWithoutVersion);

      script.id = elementName;
      script.onload = onloadFn;
      script.src = base_url + npmPackage + '/editor.js';
      head.appendChild(script);
    }
  }
}

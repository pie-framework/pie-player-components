import isFunction from 'lodash/isFunction';
import { getPackageWithoutVersion, getPackageBundleUri } from './utils/utils';
import {
  PieItemElement,
  PieContent
} from './interface';
import { BUILD_SERVICE_BASE } from './defaults';
import omit from 'lodash/omit';


export interface Entry {
  package: string;
  status: Status;
  tagName: string;
  controller?: any;
  config?: Element;
  element?: Element;
}

export enum Status {
  loading = 'loading',
  loaded = 'loaded'
}

/**
 * Pie Registry contols the loading of all PIEs from the pie build service
 */
export class PieLoader {

  constructor() {
    // read from global in case >1 instance loaded.
    window['PIE_REGISTRY'] = window['PIE_REGISTRY'] ? window['PIE_REGISTRY'] : {};
    PieLoader._registry = window['PIE_REGISTRY'];
    this.registry = PieLoader._registry;
  }

  private static _registry: Map<string,Entry>;
  protected registry:  Map<string,Entry>;

  public getController = (pieTagName: string) => {
    return this.registry[pieTagName].controller;
  };

  private getEmptyConfigure = () =>
    class extends HTMLElement {
      set model(_) {}
    };

  public elementsHaveLoaded = (el): Promise<boolean> => {
    const undefinedElements = el.querySelectorAll(':not(:defined)');
    if (undefinedElements.length == 0) {
      return Promise.resolve(false);
  }

    const promises = [...undefinedElements].map(e =>
      customElements.whenDefined(e.localName)
    );
    return Promise.all(promises)
      .then(() => {
        return Promise.resolve(true);
      })
      .catch(() => {
        return Promise.resolve(false);
      });
  };

  /**
   *
   * @param {Object<string,string>} elements elements to load from pie cloud service
   * @param {HTMLDocument} doc - the document to load the scripts
   * @param {string} base_url - default base url for cloud service
   */
  public loadCloudPies = (
    elements: PieItemElement,
    doc,
    base_url = BUILD_SERVICE_BASE
  ) => {
\
    const head = doc.getElementsByTagName('head')[0];
    const piesToLoad = this.getElementsToLoad(elements);
    const bundleUri = getPackageBundleUri(piesToLoad);
    const script = doc.createElement('script');

    const onloadFn = (_pies => {
      return () => {
        
        const pieKeys = Object.keys(_pies);

        pieKeys.forEach((key) => {
          const packagesWithoutVersion = getPackageWithoutVersion(_pies[key]);
          const pie = window['pie'].default[packagesWithoutVersion];
          const elName = key;

          if (!customElements.get(elName)) {
            customElements.define(elName, pie.Element);

            this.registry[elName] = {
              package: _pies[key],
              status: Status.loading,
              tagName: elName
            };

            customElements.whenDefined(elName).then(async () => {
              this.registry[elName].status = Status.loaded;
              this.registry[elName].element = customElements.get(elName);
              this.registry[elName].controller = pie.controller;
            });
            // This fixes some cases where the pie build service fails
            pie.Configure = isFunction(pie.Configure)
              ? pie.Configure
              : this.getEmptyConfigure();

            const configElName = elName + '-config';
            customElements.define(configElName, pie.Configure);

            customElements.whenDefined(configElName).then(async () => {
              this.registry[elName].config = customElements.get(
                configElName
              );
            });
          }
        });
      };
    })(piesToLoad);

    script.id = bundleUri;
    script.onload = onloadFn;
    script.src = base_url + bundleUri + '/editor.js';
    head.appendChild(script);
  };

  public convertPieContent = (
    content: PieContent,
    forAuthoring = true
  ): PieContent => {
    let c = content;
    // todo if markup is present, replace in-place with  new tags
    if (forAuthoring) {
      const tags = content.models.map(model => {
        return `<${model.element}-config id="${model.id}"></${
          model.element
        }-config>`;
      });
      c.markup = tags.join('');
    }

    return c;
  };

  /**
   * Given a defintion of elements, will check the registry
   * and return the elements and tags that need to be loaded.
   * 
   * @param elements - the elements to test against registry 
   */
  protected getElementsToLoad = (els: PieItemElement): PieItemElement => {
    const rKeys = Object.keys(this.registry);
    const res = omit(els, rKeys);
    return res as PieItemElement;
  }
}

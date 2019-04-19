import isFunction from 'lodash/isFunction';
import { getPackageWithoutVersion, getPackageBundleUri } from './utils/utils';
import { PieItemElement, PieContent } from './interface';
import { BUILD_SERVICE_BASE } from './defaults';
import omit from 'lodash/omit';
import retry from 'async-retry';

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
    window['PIE_REGISTRY'] = window['PIE_REGISTRY']
      ? window['PIE_REGISTRY']
      : {};
    PieLoader._registry = window['PIE_REGISTRY'];
    this.registry = PieLoader._registry;
  }

  private static _registry: Map<string, Entry>;
  protected registry: Map<string, Entry>;

  public getController = (pieTagName: string) => {
    return this.registry[pieTagName] ? this.registry[pieTagName].controller : null;
  };

  private getEmptyConfigure = () =>
    class extends HTMLElement {
      set model(_) {}
    };

  public elementsHaveLoaded = (el): Promise<boolean> => {
    const undefinedElements = el.querySelectorAll(':not(:defined)');
    if (undefinedElements.length == 0) {
      return Promise.resolve(true);
    } 

    const promises = undefinedElements ?  [...undefinedElements].map(e =>
      customElements.whenDefined(e.localName)
    ) : [];
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
  public loadCloudPies = async (
    elements: PieItemElement,
    doc,
    retryOptions = {
      retries: 10,
      minTimeout: 1000,
      maxTimeout: 5000
    },
    base_url = BUILD_SERVICE_BASE
  ) => {
    const head = doc.getElementsByTagName('head')[0];
    const piesToLoad = this.getElementsToLoad(elements);
    const bundleUri = getPackageBundleUri(piesToLoad);
    if (!bundleUri) {
      return;
    }
    const script = doc.createElement('script');
    const scriptUrl = base_url + bundleUri + '/editor.js';
    await this.scriptBuildReady(scriptUrl,retryOptions);

    const onloadFn = (_pies => {
      return () => {
        const pieKeys = Object.keys(_pies);

        pieKeys.forEach(key => {
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
              this.registry[elName].config = customElements.get(configElName);
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
    if (forAuthoring) {
      if (!c.markup && c.models) {
        const tags = content.models.map(model => {
          return `<${model.element} id="${model.id}"></${
            model.element
          }-config>`;
        });
        c.markup = tags.join('');
      } 
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
  };

  protected async scriptBuildReady(
    scriptUrl,
    opts = {
      retries: 10,
      minTimeout: 1000,
      maxTimeout: 2000
    }
  ) {
    return await retry(
      async (bail) => {
        // if anything throws retry will occur
        const res = await fetch(scriptUrl, {
          method: 'GET',
          mode: 'cors',
          headers: {
            "Content-Type": "application/text",
          }
        });
        if (res.status.toString().match("4..")) {
          bail("page error");
        }
        return res;
      },
      {
        ...opts
      }
    );
  }

  // TODO - some duplication to refactor the methods below
  async loadJs(views: string[], doc:Document): Promise<any> {
    return Promise.all(views.map(v => this.loadScript(v, doc)));
  }

  loadScript = (src, doc: Document): Promise<boolean> =>
   new Promise((resolve, reject) => {
    const script = doc.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve();
    };
    script.onerror = function(e) {
      console.log("error loading script: ", src);
      reject(e);
    };
    doc.head.appendChild(script);
  });

  defineElements(els: { [key: string]: string }): Promise<any> {
    const promises = Object.keys(els).map(k => {
      const cleaned = this.elNameCleaned(els[k]);
      const Def = (window as any).pie.default[cleaned].Element;
      if (!Def) {
        throw new Error(`missing definition for: ${cleaned}`);
      }
      if (!customElements.get(k)) {
        customElements.define(k, Def);
      }
      return customElements.whenDefined(k).then(() => {
        console.log(`${k} is defined!`);
      });
    });
    return Promise.all(promises);
  }

  elNameCleaned = e => {
    const stripped: string = e.startsWith("@") ? e.substring(1) : e;
    const arr = stripped.split("@");
    return e.startsWith("@") ? `@${arr[0]}` : arr[0];
  };
}

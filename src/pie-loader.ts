import isFunction from "lodash/isFunction";
import { getPackageWithoutVersion, getPackageBundleUri } from "./utils/utils";
import { PieItemElement, PieContent } from "./interface";
import omitBy from "lodash/omitBy";
import retry from "async-retry";

export const DEFAULT_ENDPOINTS = {
  prod: {
    bundleBase: "https://pits-cdn.pie-api.io//bundles/",
    buildServiceBase: "https://pits-dot-pie-221718.appspot.com/bundles/"
  },
  stage: {
    bundleBase: "https://pits-cdn-staging.pie-api.io/bundles/",
    buildServiceBase: "https://pits-dot-pie-staging-221718.appspot.com/bundles/"
  },
  dev: {
    bundleBase: "https://pits-cdn-dev.pie-api.io/bundles/",
    buildServiceBase: "https://pits-dot-pie-dev-221718.appspot.com/bundles/"
  }
};

export interface Entry {
  package: string;
  status: Status;
  tagName: string;
  controller?: any;
  config?: Element;
  element?: Element;
}

interface LoadedElementsQuery {
  name: string;
  tag: string;
}

interface LoadedElementsResp {
  elements: LoadedElementsQuery[];
  val: boolean;
}

export interface BundleEndpoints {
  buildServiceBase: string;
  bundleBase: string;
}

export enum Status {
  loading = "loading",
  loaded = "loaded"
}

export enum BundleType {
  player = "player.js",
  clientPlayer = "client-player.js",
  editor = "editor.js"
}

/**
 * Pie Registry contols the loading of all PIEs from the pie build service
 */
export class PieLoader {
  endpoints: BundleEndpoints;

  /**
   * Create a PieLoader instance
   * Can provide config object for endpoints, will default to to production environment preset.
   * @param endpoints an object providing {bundleBase, buildServiceBase} endpoints
   */
  constructor(_endpoints?: BundleEndpoints) {
    if (!_endpoints) {
      this.endpoints = DEFAULT_ENDPOINTS.stage;
    } else {
      this.endpoints = _endpoints;
    } 
    // read from global in case >1 instance loaded.
    window["PIE_REGISTRY"] = window["PIE_REGISTRY"]
      ? window["PIE_REGISTRY"]
      : {};
    PieLoader._registry = window["PIE_REGISTRY"];
    this.registry = PieLoader._registry;
  }

  private static _registry: { [elementName: string]: Entry };
  protected registry:  { [elementName: string]: Entry };

  public getController = (pieTagName: string) => {
    return this.registry[pieTagName]
      ? this.registry[pieTagName].controller
      : null;
  };

  private getEmptyConfigure = () =>
    class extends HTMLElement {
      set model(_) {}
    };

  public elementsHaveLoaded = (
    els: LoadedElementsQuery[]
  ): Promise<LoadedElementsResp> => {
    const promises = els.map(el => customElements.whenDefined(el.tag));

    return Promise.all(promises)
      .then(() => {
        return Promise.resolve({ elements: els, val: true });
      })
      .catch(() => {
        return Promise.resolve({ elements: els, val: false });
      });
  };

  /**
   *
   * @param {Object<string,string>} elements elements to load from pie cloud service
   * @param {HTMLDocument} doc - the document to load the scripts
   * @param {string} base_url - default base url for cloud service
   */
  public loadCloudPies = async (
    options: {
      content: PieContent;
      doc;
      retryOptions?: {
        retries: number;
        minTimeout: number;
        maxTimeout: number;
      };
      endpoints?: BundleEndpoints;
      bundle?: BundleType
    } 
  ) => {
    if (!options.endpoints) {
      options.endpoints = this.endpoints;
    }
    if (!options.bundle) {
      options.bundle = BundleType.editor;
    }
    

    const elements = options.content.elements;
    const head = options.doc.getElementsByTagName("head")[0];
    const script = options.doc.createElement("script");
    const piesToLoad = this.getElementsToLoad(elements, options.bundle, this.registry);
    let scriptUrl;

    if (options.content.bundle && options.content.bundle.url) {
      scriptUrl = options.content.bundle.url;
    } else if (options.content.bundle && options.content.bundle.hash) {
      scriptUrl = options.endpoints.bundleBase + options.content.bundle.hash + "/" + options.bundle;
    } else {
      const bundleUri = getPackageBundleUri(piesToLoad);
      if (!bundleUri) {
        return;
      }
      scriptUrl = options.endpoints.buildServiceBase + bundleUri + "/" + options.bundle;
      await this.scriptBuildReady(scriptUrl, options.retryOptions);
    }

    const onloadFn = (_pies => {
      return () => {
        const pieKeys = Object.keys(_pies);

        pieKeys.forEach(key => {
          const packagesWithoutVersion = getPackageWithoutVersion(_pies[key]);
          const pie =
            window["pie"] && window["pie"].default
              ? window["pie"].default[packagesWithoutVersion]
              : null;
          if (!pie) {
            console.log(`pie constructor not found for ${key}`);
            return;
          }
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
          }

          // This fixes some cases where the pie build service fails
          pie.Configure = isFunction(pie.Configure)
            ? pie.Configure
            : this.getEmptyConfigure();

          const configElName = elName + "-config";

          if (!customElements.get(configElName)) {
            customElements.define(configElName, pie.Configure);
            customElements.whenDefined(configElName).then(async () => {
              if (this.registry[elName]) {
                this.registry[elName].config = customElements.get(configElName);
              }
            });
          }
        });
      };
    })(piesToLoad);

    script.onload = onloadFn;
    script.src = scriptUrl;
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
        c.markup = tags.join("");
      }
    }

    return c;
  };

  /**
   *
   * @param content the `PieContent` to process
   * @param useVersions whether different (major) versions of elements will be managed separately
   */
  public normalizeElements(content: PieContent, useVersions: true) {}

  /**
   * Given a defintion of elements, will check the registry
   * and return the elements and tags that need to be loaded.
   *
   * @param elements - the elements to test against registry
   */
  protected getElementsToLoad = (els: PieItemElement, bundle: BundleType = BundleType.editor, registry): PieItemElement => {
    const res = omitBy(els, (el, key) => {
      const regEntry:Entry = registry[key];
      if (!regEntry) {
        return false;
      }
      if ((bundle === BundleType.editor) && (regEntry.config && regEntry.controller && regEntry.element)) {
        return true;
      } else if ((bundle === BundleType.clientPlayer) && (regEntry.controller && regEntry.element))  {
        return true;
      } else if ((bundle === BundleType.player) && (regEntry.element)) {
        return true;
      } else {
        return false;
      }
    });
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
      async bail => {
        // if anything throws retry will occur
        const res = await fetch(scriptUrl, {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": "application/text"
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
}

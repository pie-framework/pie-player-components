import isFunction from "lodash/isFunction";
import {
  getPackageWithoutVersion,
  getPackageBundleUri,
  withRetry
} from "./utils/utils";
import { PieItemElement, PieContent } from "./interface";
import pickBy from "lodash/pickBy";
import { emptyConfigure } from "./components/empty-configure";

window["pieHelpers"] = {
  loadingScripts: {}
};

/**
 * TODO: Clean up: PD-761
 */
export const DEFAULT_ENDPOINTS = {
  prod: {
    bundleBase: "https://pits-cdn.pie-api.io/bundles/",
    buildServiceBase: "https://proxy.pie-api.com/bundles/",
  },
  dev: {
    bundleBase: "https://pits-cdn-dev.pie-api.io/bundles/",
    buildServiceBase: "https://proxy.dev.pie-api.com/bundles/",
  },
  // this is actually not really used anymore? equals to dev
  stage: {
    bundleBase: "https://pits-cdn-dev.pie-api.io/bundles/",
    buildServiceBase: "https://proxy.dev.pie-api.com/bundles/",
  },
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

export const needToLoad = (registry: any, bundle: BundleType) => (
  el: string,
  key: string
): boolean => {
  if (!registry) {
    return true;
  }
  const regEntry: Entry = registry[key];

  if (!regEntry) {
    return true;
  }

  const { config, controller, element } = regEntry;
  switch (bundle) {
    case BundleType.editor:
      return !config || !controller || !element;
    case BundleType.clientPlayer:
      return !controller || !element;
    case BundleType.player:
      return !element;
    default:
      true;
  }
};

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
      this.endpoints = DEFAULT_ENDPOINTS.prod;
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
  protected registry: { [elementName: string]: Entry };

  public getController = (pieTagName: string) => {
    return this.registry[pieTagName]
      ? this.registry[pieTagName].controller
      : null;
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

  private getBaseUrls = (options, piesToLoad) => {
    const bundleUri = getPackageBundleUri(piesToLoad);
    if (!bundleUri) {
      return;
    }

    return (
      options.endpoints.buildServiceBase + bundleUri + "/" + options.bundle
    );
  };

  private getScriptsUrl = (options, piesToLoad): string => {
    if (options.forceBundleUrl) {
      const url = this.getBaseUrls(options, piesToLoad);

      if (url) {
        return url;
      }
    }

    if (options.content.bundle && options.content.bundle.url) {
      return options.content.bundle.url;
    }

    if (
      options.useCdn &&
      options.content.bundle &&
      options.content.bundle.hash
    ) {
      return `${options.endpoints.bundleBase + options.content.bundle.hash}/${
        options.bundle
      }`;
    }

    return this.getBaseUrls(options, piesToLoad);
  };

  /**
   *
   * @param {Object<string,string>} elements elements to load from pie cloud service
   * @param {HTMLDocument} doc - the document to load the scripts
   * @param {string} base_url - default base url for cloud service
   */
  public loadCloudPies = async (options: {
    content: PieContent;
    doc: Document;
    endpoints?: BundleEndpoints;
    bundle?: BundleType;
    useCdn: boolean;
    forceBundleUrl: boolean;
    reFetchBundle: boolean;
  }) => {
    if (!options.endpoints) {
      options.endpoints = this.endpoints;
    }
    if (!options.bundle) {
      options.bundle = BundleType.editor;
    }

    const elements = options.content.elements;
    let head: HTMLElement = options.doc.getElementsByTagName("head")[0];
    if (!head) {
      head = options.doc.createElement("head");
      options.doc.appendChild(head);
    }
    const piesToLoad = this.getElementsToLoad(
      elements,
      options.bundle,
      this.registry
    );

    let scriptUrl = this.getScriptsUrl(options, piesToLoad);

    if (!scriptUrl) {
      console.error("No script urls found for elements.");

      return;
    }

    // These scripts are actually being added to headers ONLY when the fetch below (in loadScript) returns a value
    // However, if we have multiple players that are supposed to load the same bundle on the same page,
    //  this means that we'll make that fetch request multiple times, which slows down the page
    const loadedScripts = [...head.getElementsByTagName("script")];
    // That's why we're using this little helper to store the ones that are in the process of loading as well
    const alreadyLoadingScript = window["pieHelpers"] && window["pieHelpers"].loadingScripts[scriptUrl];

    if (loadedScripts.find(s => (s.src === scriptUrl)) || alreadyLoadingScript) {
      return;
    }

    if (window["pieHelpers"] && !window["pieHelpers"].loadingScripts[scriptUrl]) {
      window["pieHelpers"].loadingScripts[scriptUrl] = true;
    }

    const script = options.doc.createElement("script");

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

          if (options.bundle === BundleType.editor) {
            // This fixes some cases where the pie build service fails
            pie.Configure = isFunction(pie.Configure)
              ? pie.Configure
              : emptyConfigure(elName);

            const configElName = elName + "-config";

            if (!customElements.get(configElName)) {
              customElements.define(configElName, pie.Configure);
              customElements.whenDefined(configElName).then(async () => {
                if (this.registry[elName]) {
                  this.registry[elName].config = customElements.get(
                    configElName
                  );
                }
              });
            }
          }
        });
      };
    })(piesToLoad);

    if (options.reFetchBundle) {
      const loadScript = async () => {
        try {
          const response = await withRetry(
            async (currentDelay: number) => {
              const res = await fetch(scriptUrl);
              // if the request fails with 503 retry it
              if (res.status === 503) {
                console.warn(
                  `Service unavailable (503), retrying in ${currentDelay / 1000 ||
                  1} seconds...`
                );

                throw new Error("Unavailable, retrying");
              }

              return res;
            },
            20,
            1000,
            30000
          );

          // if the request is successful inject the response as a script tag
          // to avoid doing the same call twice
          if (response.status === 200) {
            script.onload = onloadFn;
            script.src = scriptUrl;
            head.appendChild(script);

            delete window["pieHelpers"].loadingScripts[scriptUrl];
          } else {
            console.error("Failed to load script, status code:", response.status);
          }
        } catch (error) {
          console.error(
            "Network error occurred while trying to load script:",
            error
          );
        }
      };

      await loadScript();
    } else {
      script.onload = onloadFn;
      script.src = scriptUrl;
      head.appendChild(script);
    }
  };

  /**
   * Given a defintion of elements, will check the registry
   * and return the elements and tags that need to be loaded.
   *
   * @param elements - the elements to test against registry
   */
  protected getElementsToLoad = (
    els: PieItemElement,
    bundle: BundleType = BundleType.editor,
    registry
  ): PieItemElement => {
    return pickBy(els, needToLoad(registry, bundle));
  };
}

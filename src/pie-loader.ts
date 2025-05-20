import isFunction from "lodash/isFunction";
import pickBy from "lodash/pickBy";
import {
  getPackageWithoutVersion,
  getPackageBundleUri,
  withRetry
} from "./utils/utils";
import { emptyConfigure } from "./components/empty-configure";

import { PieItemElement, PieContent } from "./interface";
import { NewRelicEnabledClient } from "./new-relic";

window["pieHelpers"] = {
  loadingScripts: {}
};

/**
 * TODO: Clean up: PD-761
 */
export const DEFAULT_ENDPOINTS = {
  prod: {
    bundleBase: "https://pits-cdn.pie-api.io/bundles/",
    buildServiceBase: "https://proxy.pie-api.com/bundles/"
  },
  // this is actually not really used anymore? equals to dev
  stage: {
    bundleBase: "https://pits-cdn.pie-api.io/bundles/",
    buildServiceBase: "https://proxy.pie-api.com/bundles/"
  },
  dev: {
    bundleBase: "https://pits-cdn.pie-api.io/bundles/",
    buildServiceBase: "https://proxy.dev.pie-api.com/bundles/"
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
 * Configuration options for Pie Loader
 */
export type LoaderConfig = {
  /**
   * Enable tracking page actions/events with New Relic.
   * When enabled, all network requests will be instrumented.
   * Note: Setting this to true increases data sent to New Relic, which may affect costs.
   * Default: false
   */
  trackPageActions?: boolean;
};

// Default pie loader configuration values
const DEFAULT_LOADER_CONFIG: Required<LoaderConfig> = {
  trackPageActions: false
};

/**
 * Pie Registry controls the loading of all PIEs from the pie build service
 */
export class PieLoader extends NewRelicEnabledClient {
  private readonly loaderConfig: Required<LoaderConfig>;
  endpoints: BundleEndpoints;

  /**
   * Create a PieLoader instance
   * Can provide config object for endpoints, will default to to production environment preset.
   * @param _endpoints
   * @param config
   */
  constructor(_endpoints?: BundleEndpoints, config?: LoaderConfig) {
    super();

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
    this.loaderConfig = { ...DEFAULT_LOADER_CONFIG, ...config };
  }

  private static _registry: { [elementName: string]: Entry };
  protected registry: { [elementName: string]: Entry };

  public getController = (pieTagName: string) => {
    return this.registry[pieTagName]
      ? this.registry[pieTagName].controller
      : null;
  };

  public elementsHaveLoaded = async (
    els: LoadedElementsQuery[]
  ): Promise<LoadedElementsResp> => {
    const startTime = this.trackOperationStart("elementsHaveLoaded", {
      elementsQuery: els
    });
    const promises = els.map(el => customElements.whenDefined(el.tag));

    try {
      await Promise.all(promises);
      this.trackOperationComplete("elementsHaveLoaded", startTime);
      return Promise.resolve({ elements: els, val: true });
    } catch (e) {
      this.trackOperationComplete(
        "elementsHaveLoaded",
        startTime,
        false,
        "Something went wrong"
      );
      return Promise.resolve({ elements: els, val: false });
    }
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

    const startTime = this.trackOperationStart("loadCloudPies", {
      elements: options.content.elements,
      endpoints: options.endpoints,
      bundle: options.bundle,
      useCdn: options.useCdn,
      forceBundleUrl: options.forceBundleUrl,
      reFetchBundle: options.reFetchBundle
    });

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
    const alreadyLoadingScript =
      window["pieHelpers"] && window["pieHelpers"].loadingScripts[scriptUrl];

    if (loadedScripts.find(s => s.src === scriptUrl) || alreadyLoadingScript) {
      return;
    }

    if (
      window["pieHelpers"] &&
      !window["pieHelpers"].loadingScripts[scriptUrl]
    ) {
      window["pieHelpers"].loadingScripts[scriptUrl] = true;
    }

    const script = options.doc.createElement("script");

    const onloadFn = (_pies => {
      return () => {
        const defineElemsStartTime = this.trackOperationStart(
          "defineCustomElements",
          { items: _pies }
        );

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

        this.trackOperationComplete(
          "defineCustomElements",
          defineElemsStartTime
        );
      };
    })(piesToLoad);

    if (options.reFetchBundle) {
      const loadScript = async () => {
        const loadScriptStartTime = this.trackOperationStart(
          "loadScript",
          { scriptUrl },
          true
        );

        try {
          const response = await withRetry(
            async (currentDelay: number) => {
              const res = await fetch(scriptUrl);

              // if the request fails with 503, retry it
              if (res.status === 503) {
                const errorMsg = `Service unavailable (503), retrying in ${currentDelay /
                  1000 || 1} seconds...`;
                console.warn(errorMsg);

                throw new Error(errorMsg);
              }

              return res;
            },
            20,
            1000,
            30000
          );

          // if the request is successful, inject the response as a script tag to avoid doing the same call twice
          if (response.status === 200) {
            script.onload = onloadFn;
            script.src = scriptUrl;
            head.appendChild(script);

            delete window["pieHelpers"].loadingScripts[scriptUrl];

            this.trackOperationComplete(
              "loadScript",
              loadScriptStartTime,
              true
            );
          } else {
            const errorMsg = `Failed to load script, status code: ${
              response.status
            }`;
            console.error(errorMsg);
            this.trackOperationComplete(
              "loadScript",
              loadScriptStartTime,
              true,
              errorMsg
            );
          }
        } catch (error) {
          console.error(
            "Network error occurred while trying to load script:",
            error
          );

          this.trackOperationComplete(
            "loadScript",
            loadScriptStartTime,
            true,
            error.message
          );
        }
      };

      await loadScript();
    } else {
      script.onload = onloadFn;
      script.src = scriptUrl;
      head.appendChild(script);
    }

    this.trackOperationComplete("loadCloudPies", startTime);
  };

  /**
   * Given a definition of elements, will check the registry
   * and return the elements and tags that need to be loaded.
   *
   * @param els
   * @param bundle
   * @param registry
   */
  protected getElementsToLoad = (
    els: PieItemElement,
    bundle: BundleType = BundleType.editor,
    registry
  ): PieItemElement => {
    return pickBy(els, needToLoad(registry, bundle));
  };

  /**
   * Implementation of the abstract method from NewRelicEnabledClient
   */
  protected getTrackingBaseAttributes(): Record<string, any> {
    return {
      endpoints: this.endpoints,
      networkInfo: this.getNetworkInfo()
    };
  }

  /**
   * Check if an error is a network error
   */
  private isNetworkError(error: Error): boolean {
    return (
      error.name === "AbortError" ||
      error instanceof TypeError ||
      error.message.includes("NetworkError") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("Network request failed") ||
      !(typeof navigator !== "undefined" && navigator.onLine)
    );
  }

  /**
   * Track operation start if trackPageActions is enabled
   */
  private trackOperationStart(
    operationName: string,
    data: Record<string, any> = {},
    apiRequest: boolean = false
  ) {
    const startTime = Date.now();

    if (!this.loaderConfig.trackPageActions || !this.newRelic) {
      return startTime;
    }

    const operationType = apiRequest ? "api" : "pie";

    this.track("activity", `${operationType}_${operationName}_started`, {
      data: JSON.stringify(data),
      timestamp: new Date().toISOString()
    });

    return startTime;
  }

  /**
   * Track operation complete if trackPageActions is enabled
   */
  private trackOperationComplete(
    operationName: string,
    startTime: number,
    apiRequest?: boolean = false,
    errorMessage?: string
  ) {
    if (this.loaderConfig.trackPageActions || !this.newRelic) {
      return;
    }

    const operationType = apiRequest ? "api" : "pie";

    this.track("activity", `${operationType}_${operationName}_complete`, {
      duration: Date.now() - startTime,
      success: errorMessage ? false : true,
      ...(errorMessage && { errorMessage })
    });
  }
}

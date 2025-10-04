import { SessionChangedEvent } from "@pie-framework/pie-player-events";
import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Method,
  Prop,
  State,
  Watch
} from "@stencil/core";
import {
  AdvancedItemConfig,
  ConfigResource,
  Env,
  ItemConfig,
  ItemSession,
  PieContent,
  PieController,
  PieElement,
  PieModel
} from "../../interface";
import {
  PieLoader,
  BundleType,
  DEFAULT_ENDPOINTS,
  BundleEndpoints,
  LoaderConfig
} from "../../pie-loader";
import { EsmPieLoader } from "../../loaders/EsmPieLoader";
import { addRubric } from "../../rubric-utils";
import { normalizeContentElements } from "../../utils/utils";
import { VERSION } from "../../version";

const controllerErrorMessage: string =
  "Error processing question configuration, verify the question model?";

@Component({
  tag: "pie-player",
  styleUrl: "../components.css",
  shadow: false
})
export class Player {
  /**
   * a reference to the active player when wrapping playert in stimulus layout
   */
  stimulusPlayer: HTMLElement;

  @Prop({ context: "document" }) doc!: Document;

  /**
   * Optionally specifies the back-end that builds and hosts javascript bundles for rendering assessment items.
   * This property lets you choose which environment to use, from 'dev' , 'stage' or 'prod' environments.
   * Until 1.0 will default to 'stage'.
   * Starting v2.0.3, it will temporarily redirect to production only
   */
  @Prop() bundleHost?: string;

  /**
   * Provide this property override the default endpoints used by the player to retrieve JS
   * bundles. Must be set before setting the config property.
   * Most users will not need to use this property.
   */
  @Prop() bundleEndpoints?: BundleEndpoints;

  /**
   * Allows disabling of the default behaviour which is to look up and load the JS bundle that define the Custom Elements
   * used by the item config.
   * This if for advanced use cases when using the pie-player in a container that is managing loading of Custom Elements and Controllers.
   */
  @Prop() disableBundler: boolean = false;

  /**
   * Specifies the bundle format to use for loading PIE elements.
   * - 'auto': Automatically detects browser support and uses ESM if available, falls back to IIFE (default, recommended)
   * - 'esm': Force ESM loading (will fall back to IIFE if not supported)
   * - 'iife': Force IIFE loading (all browsers)
   * 
   * In 'auto' mode, modern browsers (Chrome 89+, Firefox 108+, Safari 16.4+) will use ESM for better performance.
   * Older browsers will automatically use IIFE. No configuration needed!
   */
  @Prop() bundleFormat?: 'auto' | 'esm' | 'iife' = 'auto';

  /**
   * Base URL for the ESM CDN when bundleFormat is 'esm'.
   * Defaults to 'https://esm.sh' (public CDN).
   * 
   * Common options:
   * - 'https://esm.sh' - Public CDN (default, open source)
   * - 'https://proxy.pie-api.com/npm' - Private proxy with CloudFront caching
   * - 'https://cdn.jsdelivr.net/npm' - Alternative public CDN
   * 
   * Only used when bundleFormat='esm'. Ignored for IIFE bundles.
   */
  @Prop() esmCdnUrl?: string = 'https://esm.sh';

  /**
   * Timeout in milliseconds for probing package availability on the CDN.
   * Default: 1000ms (1 second)
   * 
   * Use cases:
   * - Fast networks: Lower to 500ms for quicker fallback
   * - Slow networks: Increase to 2000ms to avoid premature timeouts
   * - Development: Lower to 500ms for faster iteration
   * 
   * Only used when bundleFormat='auto' or 'esm'. Ignored for IIFE.
   */
  @Prop() esmProbeTimeout?: number = 1000;

  /**
   * Cache TTL in milliseconds for package availability probe results.
   * Default: 3600000ms (1 hour)
   * 
   * Use cases:
   * - Production: Keep at 1 hour (package versions are immutable)
   * - Development: Lower to 60000ms (1 minute) for testing
   * - Long sessions: Increase to 86400000ms (24 hours) for stability
   * 
   * Only used when bundleFormat='auto' or 'esm'. Ignored for IIFE.
   */
  @Prop() esmProbeCacheTtl?: number = 60 * 60 * 1000;

  @Element() el: HTMLElement;

  // Note - the below not handled, just added here for API docs
  /**
   * Emmitted when any interaction in the set of interactions being rendered has
   * been mutated by user action.
   *
   * The `Event.detail` property contains a `complete` property.
   * If true, this indicates that enough data has been gathered by the interaciton to constitute a response.
   * For example, in a plot line questsion where a user had to plot three points to plot the line,
   * the `complete` propery would be false if 1 or 2 points had been added, but true if all three had.
   *
   */
  @Event({ eventName: "session-changed" }) sessionChanged: EventEmitter;

  /**
   * Emmitted if there is an error encountered while rendering.
   * `event.detail` will be a string containing a message about the error.
   */
  @Event({ eventName: "player-error" }) playerError: EventEmitter;

  /**
   * TODO - Emmitted when any all interactions in a PIE Assessment Item have reported that a user
   * has provided a response to the interaction.
   */
  @Event() responseCompleted: EventEmitter;

  /**
   * Emitted when the content in the config has been loaded.
   */
  @Event({ eventName: "load-complete" }) loadComplete: EventEmitter;

  @State() elementsLoaded: boolean = false;

  /**
   * The Pie config model.
   */
  @Prop() config: ItemConfig;

  /**
   * Simulates a correct response for the item.
   * This property will only have this effect if the `hosted` property is
   * false and player is running client-side-only.
   */
  @Prop() addCorrectResponse: boolean = false;

  /**
   * In evaluate mode, add a bottom border to visually separate each item in the case of a multi-item
   */
  @Prop() showBottomBorder: boolean = false;

  /**
   * used to automatically re-fetch the bundle (in case we get a 503)
   */
  @Prop() reFetchBundle?: boolean = false;

  /**
   * The Pie loader config.
   */
  @Prop() loaderConfig: LoaderConfig;

  @Watch("addCorrectResponse")
  watchAddCorrectResponse(newValue, oldValue) {
    if (newValue !== oldValue) {
      this.updateModels();
    }
  }

  /**
   * The Pie Session
   */
  @Prop() session: ItemSession = { id: "", data: [] };

  /**
   * Describes runtime environment for the player.
   *
   */
  @Prop() env: Env = { mode: "gather", role: "student" };

  /**
   * Indicates if player running in the context of a PIE hosting system.
   * Do not modify the default value for this property if you are not implementing a PIE host.
   * If true, the host is responsible for all model updates.
   */
  @Prop() hosted?: boolean = false;

  /**
   * If the item contains a stimulus, the player will render it by default.
   * Set this property to false to not render stimulus.
   */
  @Prop() renderStimulus: boolean = true;

  @Prop({ mutable: false, reflect: false })
  version: string = VERSION;

  /**
   * Allow to resize pie-stimulus layout
   * Set this property to false to not render the resizer.
   */
  @Prop() allowedResize?: boolean = false;

  @State() pieContentModel: PieContent;
  /**
   * Optional CSS class for the stimulus container wrapper
   */
  @Prop() passageContainerClass?: string;
  /**
   * Optional CSS class for the item player container
   */
  @Prop() containerClass?: string;

  @State() stimulusItemModel: AdvancedItemConfig;

  /**
   * Support styling with external stylesheet urls (comma separated urls)
   * Target the pie-player component using the class provided in the class property
   * Parse the css file and add the class to the stylesheet to scope the styles
   * The last stylesheet url takes priority if the selectors have the same specificity.
   * If no class is provided, a random class will be generated to scope the styles.
   * We did not use the shadow DOM for the pie-player component, so we need to scope the styles manually.
   * @example
   * <pie-player external-style-urls="https://example.com/style.css,https://example.com/another-style.css"
   *             custom-classname="my-custom-class"></pie-player>
   * This will load the styles from the provided URLs and scope them to the pie-player component using the pie-player.my-custom-class selector.
   * If no custom class name is provided, a random class will be generated, such as `pie-player-abc12345`.
   */
  @Prop() externalStyleUrls: string = "";

  /**
   * A custom class name to scope the styles to the pie-player component.
   * The custom class name is used to scope the styles from the externalStyleUrls property, by using the pie-player.[CUSTOM_CLASS] selector.
   * If not provided, a random class will be generated, such as `pie-player-abc12345`.
   * This is useful for styling the pie-player component in a specific way, without affecting other
   * components that may use the same styles.
   */
  @Prop() customClassname: string = "";

  pieLoader = new PieLoader(null, undefined);
  private loadingStyles = new Set<string>();

  player() {
    return this.stimulusPlayer ? this.stimulusPlayer : this;
  }

  @Watch("config")
  async watchConfig(newConfig) {
    this.elementsLoaded = false;

    try {
      if (!newConfig) {
        return;
      }
      try {
        if (typeof newConfig == "string") {
          newConfig = JSON.parse(newConfig);
        }
        if (newConfig.pie) {
          this.stimulusItemModel = newConfig;
          return; // if stimulus item
        } else if (newConfig.elements) {
          this.pieContentModel = addRubric(newConfig);
          this.pieContentModel = normalizeContentElements(this.pieContentModel);
        } else {
          this.playerError.emit(`invalid pie data model`);
          return;
        }
      } catch (err) {
        this.playerError.emit(
          `exception processing content model - ${err.message}`
        );
        return;
      }

      if (!this.elementsLoaded && !this.disableBundler) {
        let endpoints = DEFAULT_ENDPOINTS.prod;

        if (
          this.bundleHost &&
          ["dev", "stage", "prod"].includes(this.bundleHost)
        ) {
          endpoints = DEFAULT_ENDPOINTS[this.bundleHost];
        }

        // if bundleEndpoints are provided, use them instead of the default
        // used for proxies, etc.
        let forceBundleUrl = false;
        if (this.bundleEndpoints) {
          endpoints = this.bundleEndpoints;
          forceBundleUrl = true;
        }

        // Try ESM (auto-detect or explicit)
        if (this.bundleFormat === 'auto' || this.bundleFormat === 'esm') {
          try {
            const esmLoader = new EsmPieLoader({
              cdnBaseUrl: this.esmCdnUrl,
              probeTimeout: this.esmProbeTimeout,
              probeCacheTtl: this.esmProbeCacheTtl
            });
            
            const modeLabel = this.bundleFormat === 'auto' ? 'Auto-detect mode' : 'Explicit ESM mode';
            console.log(`[pie-player] ${modeLabel}: attempting ESM load from`, this.esmCdnUrl);
            
            // Loader handles all decision logic (browser check, probe, etc.)
            await esmLoader.loadWithFormat(this.pieContentModel, this.doc, this.bundleFormat);
            
            // Success!
            this.elementsLoaded = true;
            console.log('[pie-player] ✅ ESM loading complete');
            return; // Don't try IIFE
          } catch (error) {
            const errorMessage = (error as any).message || '';
            if (errorMessage.includes('ESM_NOT_SUPPORTED')) {
              console.info('[pie-player] ESM not available, falling back to IIFE');
              console.info('[pie-player] Reason:', errorMessage);
              // Fall through to IIFE loading below
            } else {
              // Re-throw other errors (actual loading failures)
              throw error;
            }
          }
        }
        
        // IIFE loading (fallback or explicitly requested)
        await this.pieLoader.loadCloudPies({
          content: this.pieContentModel,
          doc: this.doc,
          endpoints: endpoints,
          bundle: this.hosted ? BundleType.player : BundleType.clientPlayer,
          useCdn: false,
          forceBundleUrl,
          reFetchBundle: this.reFetchBundle
        });
      }
    } catch (err) {
      this.playerError.emit(`problem loading item (${err})`);
    }
  }

  /**
   * For previewing changes to an item. Updates the model for one question in the item model.
   * @param update the updated model
   */
  @Method()
  async updateElementModel(update: PieModel) {
    if (this.pieContentModel && this.pieContentModel.models) {
      const index = this.pieContentModel.models.findIndex(
        m => m.id === update.id
      );

      if (index !== -1) {
        this.pieContentModel.models.splice(index, 1, update);
      }
      await this.updateModels();
    }
  }

  private getModelsForScoring() {
    // Handle stimulus items
    if (this.stimulusItemModel && this.stimulusItemModel.pie) {
      return this.stimulusItemModel.pie.models || [];
    }
    // Handle regular items
    if (this.pieContentModel && this.pieContentModel.models) {
      return this.pieContentModel.models || [];
    }
    return [];
  }

  @Method()
  async provideScore() {
    // TODO I think we have to check if it's hosted or not to expose this function
    // Get models to score - handle both stimulus items and regular items
    const modelsToScore = this.getModelsForScoring();

    if (!modelsToScore || modelsToScore.length === 0) {
      console.error('No models available for scoring');
      return false;
    }

    return Promise.all(
      modelsToScore.map(async model => {
        let pieEl: PieElement = this.el.querySelector(`[id='${model.id}']`);
        !pieEl && (pieEl = this.el.querySelector(`[pie-id='${model.id}']`));

        const session = this.findOrAddSession(this.session.data, model.id);

        if (pieEl) {
          const controller: PieController = this.pieLoader.getController(
            pieEl.localName
          );

          if (controller && controller.outcome) {
            console.log("env-->", this.env);
            return {
              ...session,
              ...(await controller.outcome(model, session, {
                mode: "evaluate",
                partialScoring: this.env.partialScoring
              }))
            };
          }
        }
      })
    );
  }

  @Watch("env")
  updateModels(newEnv = this.env) {
    // wrapping a player in stimulus layout
    if (this.stimulusPlayer) {
      (this.stimulusPlayer as any).env = newEnv;
      return;
    }

    performance.mark("pie-model-set-start");

    if (
      this.pieContentModel &&
      this.pieContentModel.models &&
      typeof this.pieContentModel.models.forEach === "function" &&
      this.pieContentModel.markup &&
      this.elementsLoaded
    ) {
      /**
       * Block session changed events while we set model/session on the elements.
       * TODO: The elements should *not* be firing 'session-changed' when the session is set.
       * They should only fire this if a user has made a change. Can we guarantee that?
       */
      this.el.addEventListener(
        SessionChangedEvent.TYPE,
        this.stopEventFromPropagating
      );

      this.pieContentModel.models.forEach(async (model, index) => {
        if (model && model.error) {
          this.playerError.emit(`error loading question data`);
          throw new Error(model.error);
        }
        const pieEl: PieElement = this.el.querySelector(`[id='${model.id}']`);
        let session = this.findOrAddSession(this.session.data, model.id);
        if (pieEl) {
          if (!this.hosted) {
            try {
              // use local controllers
              const controller: PieController = this.pieLoader.getController(
                pieEl.localName
              );
              if (controller) {
                if (
                  this.addCorrectResponse &&
                  controller.createCorrectResponseSession &&
                  typeof controller.createCorrectResponseSession === "function"
                ) {
                  session = await controller.createCorrectResponseSession(
                    model,
                    { ...newEnv, ...{ role: "instructor" } }
                  );
                }
                pieEl.model = await controller.model(model, session, newEnv);
              } else {
                // no controller provided
                pieEl.model = model;
              }
            } catch (err) {
              this.playerError.emit(`${controllerErrorMessage}  -  (${err})`);
            }
          } else {
            if ((model as any).error) {
              this.playerError.emit(
                `${controllerErrorMessage}  -  '${(model as any).error}'`
              );
            }
            pieEl.model = model;
            if (this.addCorrectResponse) {
              this.playerError.emit(
                `add-correct-response cannot be used in hosted environement`
              );
            }
          }
          try {
            pieEl.session = session;
          } catch (err) {
            this.playerError.emit(
              `error setting item session value - ${err.message}`
            );
          }
        }
      });

      performance.mark("pie-model-set-end");
      performance.measure(
        "PIE Model Setup Time",
        "pie-model-set-start",
        "pie-model-set-end"
      );
      const modelEntry = performance.getEntriesByName(
        "PIE Model Setup Time"
      )[0];
      const modelDuration = modelEntry ? modelEntry.duration : 0;
      console.log("[PIE Model Setup Time]", modelDuration.toFixed(2), "ms");

      setTimeout(() => {
        /** remove the event blocker - see above */
        this.el.removeEventListener(
          SessionChangedEvent.TYPE,
          this.stopEventFromPropagating
        );
        //TODO: is this needed anymore? maybe it should be using 'model-set' instead of 'session-changed' which is what it was using.
        this.loadComplete.emit();
      }, 150);
    }
  }

  private stopEventFromPropagating(e: CustomEvent) {
    e.stopPropagation();
  }

  private scopeCSS(cssText: string) {
    const prefix = `pie-player.${this.customClassname}`;
    console.log(`[style-loader] Scoping CSS with prefix: ${prefix}`);
    return cssText.replace(/(^|\})\s*([^\{]+)\s*\{/g, (_, close, selector) => {
      const scoped = selector
        .split(",")
        .map((s: string) => `${prefix} ${s.trim()}`)
        .join(", ");
      return `${close} ${scoped} {`;
    });
  }

  private async loadScopedExternalStyle(url: string) {
    if (
      document.querySelector(`style[data-pie-style="${url}"]`) ||
      this.loadingStyles.has(url)
    ) {
      return;
    }
    this.loadingStyles.add(url);
    try {
      const startTime = performance.now();
      console.log(`[style-loader] Fetching CSS: ${url}`);
      const res = await fetch(url);
      const css = await res.text();
      const fetchEnd = performance.now();
      console.log(
        `[style-loader] Fetch complete in ${(fetchEnd - startTime).toFixed(
          2
        )}ms`
      );

      const scopeStart = performance.now();
      const scopedCSS = this.scopeCSS(css);
      const scopeEnd = performance.now();
      console.log(
        `[style-loader] CSS scoped in ${(scopeEnd - scopeStart).toFixed(2)}ms`
      );

      const styleTag = document.createElement("style");
      styleTag.setAttribute("data-pie-style", url);
      styleTag.textContent = scopedCSS;
      document.head.appendChild(styleTag);
    } catch (err) {
      console.error(
        `[style-loader] Error loading stylesheet from ${url}:`,
        err
      );
    } finally {
      this.loadingStyles.delete(url);
    }
  }

  async componentWillLoad() {
    if (this.config) {
      this.watchConfig(this.config);
    }

    if (!this.customClassname) {
      this.customClassname = `pie-player-${Math.random()
        .toString(36)
        .substr(2, 8)}`;
    }
    let configResources: ConfigResource | undefined = undefined;
    if (this.pieContentModel && this.pieContentModel.resources) {
      configResources = this.pieContentModel.resources;
    }
    const advancedConfig: AdvancedItemConfig =
      this.stimulusItemModel || (this.config as AdvancedItemConfig);
    if (
      !configResources &&
      advancedConfig &&
      advancedConfig.pie &&
      advancedConfig.pie.resources
    ) {
      configResources = advancedConfig.pie.resources;
    }
    if (!configResources) {
      return;
    }
    // add the container classes from the config
    if (configResources.containerClass) {
      this.containerClass = configResources.containerClass;
    }
    if (configResources.passageContainerClass) {
      this.passageContainerClass = configResources.passageContainerClass;
    }
  }

  findOrAddSession(data: any[], id: string) {
    const s = data.find(d => d.id === id);
    if (s) {
      return s;
    }
    const ss = { id };
    data.push(ss);
    return ss;
  }

  private renderMath() {
    const MR = (window as any)["@pie-lib/math-rendering"];

    if (MR && typeof MR.renderMath === "function") {
      MR.renderMath(this.el);
    }
  }

  private addBottomBorder(tags: string[]) {
    if (!Array.isArray(tags)) {
      return;
    }

    tags.forEach(tag => {
      const elems = document.querySelectorAll(`${tag}`);

      for (const elem of elems) {
        if (elem && elem instanceof HTMLElement) {
          elem.classList.add("evaluate-bottom-border");
        }
      }
    });
  }

  async afterRender() {
    if (this.pieContentModel && this.pieContentModel.markup) {
      if (this.elementsLoaded) {
        this.updateModels();
        this.renderMath();

        if (this.showBottomBorder && this.env.mode === "evaluate") {
          const pieTags =
            this.pieContentModel.elements &&
            Object.keys(this.pieContentModel.elements);
          this.addBottomBorder(pieTags);
        }
      } else {
        const elements = Object.keys(this.pieContentModel.elements).map(el => ({
          name: el,
          tag: el
        }));

        // Note: hard to verify but it appears that we need to resolve
        // the value first rather than setting the promise directly on
        // this state property - otherwise lifecycle re-render is triggered too early
        const loadedInfo = await this.pieLoader.elementsHaveLoaded(elements);

        if (
          loadedInfo.val &&
          !!loadedInfo.elements.find(
            el => this.pieContentModel.elements[el.name]
          )
        ) {
          this.elementsLoaded = true;

          if (performance.getEntriesByName("pie-load-end").length > 0) {
            performance.mark("pie-elements-load-end");
            performance.measure(
              "PIE Elements Load Time",
              "pie-load-end",
              "pie-elements-load-end"
            );

            const renderEntry = performance.getEntriesByName(
              "PIE Elements Load Time"
            )[0];
            const renderDuration = renderEntry ? renderEntry.duration : 0;
            console.log(
              "[PIE Elements Load + Render Time]",
              renderDuration.toFixed(2),
              "ms"
            );
          }
        }
      }
    }

    if (
      this.externalStyleUrls &&
      typeof this.externalStyleUrls === "string" &&
      this.customClassname &&
      typeof this.customClassname === "string"
    ) {
      const urls = this.externalStyleUrls.split(",").map(url => url.trim());

      urls.forEach(url => {
        if (
          url &&
          typeof url === "string" &&
          !document.querySelector(`style[data-pie-style="${url}"]`)
        ) {
          this.loadScopedExternalStyle(url);
        }
      });
    }

    // handle stylesheets from config.resources like externalStyleUrl
    // if the player is not a stimulus player, because we don't want to load stylesheets twice
    // the stimulus player will be rendered with the player component
    if (this.stimulusPlayer) {
      return;
    }

    let configResources: ConfigResource | undefined = undefined;
    if (this.pieContentModel && this.pieContentModel.resources) {
      configResources = this.pieContentModel.resources;
    }
    const advancedConfig: AdvancedItemConfig =
      this.stimulusItemModel || (this.config as AdvancedItemConfig);
    if (
      !configResources &&
      advancedConfig &&
      advancedConfig.pie &&
      advancedConfig.pie.resources
    ) {
      configResources = advancedConfig.pie.resources;
    }
    if (!configResources) {
      return;
    }
    if (
      configResources.stylesheets &&
      Array.isArray(configResources.stylesheets)
    ) {
      configResources.stylesheets.forEach(resource => {
        const url = resource.url;
        if (
          url &&
          typeof url === "string" &&
          !document.querySelector(`style[data-pie-style="${url}"]`)
        ) {
          this.loadScopedExternalStyle(url);
        }
      });
    }
  }

  async componentDidLoad() {
    await this.afterRender();
  }

  async componentDidUpdate() {
    await this.afterRender();
  }

  render() {
    return this.stimulusItemModel ? (
      this.renderStimulus ? (
        <pie-stimulus-layout allowedResize={this.allowedResize}>
          <div slot="stimulus" class={`player-stimulus-container`}>
            <pie-player
              id="stimulusPlayer"
              config={this.stimulusItemModel.passage}
              env={this.env}
              hosted={this.hosted}
              session={this.session}
              ref={el => (this.stimulusPlayer = el as HTMLElement)}
              bundleHost={this.bundleHost}
              bundleEndpoints={this.bundleEndpoints}
              class={`${this.customClassname}${
                this.passageContainerClass
                  ? ` ${this.passageContainerClass}`
                  : ""
              }`}
              customClassname={this.customClassname}
            />
          </div>
          <div slot="item" class={`player-item-container`}>
            <pie-player
              id="itemPlayer"
              addCorrectResponse={this.addCorrectResponse}
              config={this.stimulusItemModel.pie}
              env={this.env}
              hosted={this.hosted}
              session={this.session}
              bundleHost={this.bundleHost}
              bundleEndpoints={this.bundleEndpoints}
              class={`${this.customClassname}${
                this.containerClass ? ` ${this.containerClass}` : ""
              }`}
              customClassname={this.customClassname}
            />
          </div>
        </pie-stimulus-layout>
      ) : this.containerClass ? (
        <div class={this.containerClass}>
          <pie-player
            id="itemPlayer"
            addCorrectResponse={this.addCorrectResponse}
            config={this.stimulusItemModel.pie}
            env={this.env}
            hosted={this.hosted}
            session={this.session}
            bundleHost={this.bundleHost}
            bundleEndpoints={this.bundleEndpoints}
            class={this.customClassname}
            customClassname={this.customClassname}
          />
        </div>
      ) : (
        <pie-player
          id="itemPlayer"
          addCorrectResponse={this.addCorrectResponse}
          config={this.stimulusItemModel.pie}
          env={this.env}
          hosted={this.hosted}
          session={this.session}
          bundleEndpoints={this.bundleEndpoints}
          class={this.customClassname}
          customClassname={this.customClassname}
        />
      )
    ) : this.elementsLoaded ? (
      <div
        class="player-container"
        innerHTML={
          this.pieContentModel && this.pieContentModel.markup
            ? this.pieContentModel.markup
            : ""
        }
      />
    ) : (
      <pie-spinner />
    );
  }
}

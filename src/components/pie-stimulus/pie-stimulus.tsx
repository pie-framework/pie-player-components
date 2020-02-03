import { SessionChangedEvent } from "@pie-framework/pie-player-events";
import mr from "@pie-lib/math-rendering";
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
import { ItemConfig, PieContent, PieElement, PieModel } from "../../interface";
import {
  PieLoader,
  BundleType,
  DEFAULT_ENDPOINTS,
  BundleEndpoints
} from "../../pie-loader";
import { normalizeContentElements } from "../../utils/utils";
import { VERSION } from "../../version";

const controllerErrorMessage: string =
  "Error processing question configuration, verify the question model?";

@Component({
  tag: "pie-stimulus",
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

  @Element() el: HTMLElement;

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
   * Describes runtime environment for the player.
   *
   */
  @Prop() env: Object = { mode: "gather", role: "student" };

  /**
   * Indicates if player running in the context of a PIE hosting system.
   * Do not modify the default value for this property if you are not implementing a PIE host.
   * If true, the host is responsible for all model updates.
   */
  @Prop() hosted?: boolean = false;

  @Prop({ mutable: false, reflect: false })
  version: string = VERSION;

  @State() pieContentModel: PieContent;

  pieLoader = new PieLoader();

  @Watch("config")
  async watchConfig(newConfig) {
    this.elementsLoaded = false;

    try {
      if (!newConfig) {
        return;
      }
      try {
        if (newConfig.elements) {
          this.pieContentModel = normalizeContentElements(newConfig);
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
        let endpoints = DEFAULT_ENDPOINTS.stage;
        if (
          this.bundleHost &&
          ["dev", "stage", "prod"].includes(this.bundleHost)
        ) {
          endpoints = DEFAULT_ENDPOINTS[this.bundleHost];
        }
        if (this.bundleEndpoints) {
          endpoints = this.bundleEndpoints;
        }

        await this.pieLoader.loadCloudPies({
          content: this.pieContentModel,
          doc: this.doc,
          endpoints: endpoints,
          bundle: this.hosted ? BundleType.player : BundleType.clientPlayer,
          useCdn: false
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

  @Watch("env")
  updateModels(newEnv = this.env) {
    // wrapping a player in stimulus layout
    if (this.stimulusPlayer) {
      (this.stimulusPlayer as any).env = newEnv;
      return;
    }

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
        if (pieEl) {
          if (!this.hosted) {
            try {
              pieEl.model = model;
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
          }
        }
      });
      setTimeout(() => {
        //TODO: is this needed anymore? maybe it should be using 'model-set' instead of 'session-changed' which is what it was using.
        this.loadComplete.emit();
      }, 150);
    }
  }

  private stopEventFromPropagating(e: CustomEvent) {
    e.stopPropagation();
  }

  async componentWillLoad() {
    if (this.config) {
      this.watchConfig(this.config);
    }
  }

  private renderMath() {
    setTimeout(() => {
      mr.renderMath(this.el);
    }, 50);
  }

  async afterRender() {
    if (this.pieContentModel && this.pieContentModel.markup) {
      if (this.elementsLoaded) {
        this.updateModels();
        this.renderMath();
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
        }
      }
    }
  }

  async componentDidLoad() {
    await this.afterRender();
  }

  async componentDidUpdate() {
    await this.afterRender();
  }

  render() {
    return (
      <div
        innerHTML={
          this.pieContentModel && this.pieContentModel.markup
            ? this.pieContentModel.markup
            : ""
        }
      />
    );
  }
}

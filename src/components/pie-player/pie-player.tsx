import {SessionChangedEvent} from "@pie-framework/pie-player-events";
import {
  _dll_pie_lib__pie_toolbox_math_rendering_accessible
} from "@pie-lib/pie-toolbox-math-rendering-module/module";
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
  BundleEndpoints
} from "../../pie-loader";
import {addRubric} from "../../rubric-utils";
import {normalizeContentElements} from "../../utils/utils";
import {VERSION} from "../../version";

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

  @Prop({context: "document"}) doc!: Document;

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
  @Event({eventName: "session-changed"}) sessionChanged: EventEmitter;

  /**
   * Emmitted if there is an error encountered while rendering.
   * `event.detail` will be a string containing a message about the error.
   */
  @Event({eventName: "player-error"}) playerError: EventEmitter;

  /**
   * TODO - Emmitted when any all interactions in a PIE Assessment Item have reported that a user
   * has provided a response to the interaction.
   */
  @Event() responseCompleted: EventEmitter;

  /**
   * Emitted when the content in the config has been loaded.
   */
  @Event({eventName: "load-complete"}) loadComplete: EventEmitter;

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

  @Watch("addCorrectResponse")
  watchAddCorrectResponse(newValue, oldValue) {
    if (newValue !== oldValue) {
      this.updateModels();
    }
  }

  /**
   * The Pie Session
   */
  @Prop() session: ItemSession = {id: "", data: []};

  /**
   * Describes runtime environment for the player.
   *
   */
  @Prop() env: Env = {mode: "gather", role: "student"};

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

  @Prop({mutable: false, reflect: false})
  version: string = VERSION;

  /**
   * Allow to resize pie-stimulus layout
   * Set this property to false to not render the resizer.
   */
  @Prop() allowedResize?: boolean = false;

  @State() pieContentModel: PieContent;

  @State() stimulusItemModel: AdvancedItemConfig;

  pieLoader = new PieLoader();

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

  @Method()
  async provideScore() {
    // TODO I think we have to check if it's hosted or not to expose this function
    if (!this.pieContentModel || !this.pieContentModel.models) {
      console.error('No pie content model');

      return false;
    }

    return Promise.all((this.pieContentModel.models || []).map(async model => {
      let pieEl: PieElement = this.el.querySelector(`[id='${model.id}']`);
      !pieEl && (pieEl = this.el.querySelector(`[pie-id='${model.id}']`));

      const session = this.findOrAddSession(this.session.data, model.id);

      if (pieEl) {
        const controller: PieController = this.pieLoader.getController(pieEl.localName);

        if (controller && controller.outcome) {
          return {
            ...session,
            ...(await controller.outcome(model, session, {mode: 'evaluate'}))
          };
        }
      }
    }));
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
                    {...newEnv, ...{role: "instructor"}}
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

  async componentWillLoad() {
    if (this.config) {
      this.watchConfig(this.config);
    }
  }

  findOrAddSession(data: any[], id: string) {
    const s = data.find(d => d.id === id);
    if (s) {
      return s;
    }
    const ss = {id};
    data.push(ss);
    return ss;
  }

  private renderMath() {
    setTimeout(() => {
      _dll_pie_lib__pie_toolbox_math_rendering_accessible.renderMath(this.el);
    }, 50);
  }

  private addBottomBorder(tags: string[]) {
    if (!Array.isArray(tags)) {
      return;
    }

    tags.forEach(tag => {
      const elems = document.querySelectorAll(`${tag}`)

      for (const elem of elems) {
        if (elem && elem instanceof HTMLElement) {
          elem.classList.add('evaluate-bottom-border');
        }
      }
    });
  }

  async afterRender() {
    if (this.pieContentModel && this.pieContentModel.markup) {
      if (this.elementsLoaded) {
        this.updateModels();
        this.renderMath();

        if (this.showBottomBorder && this.env.mode === 'evaluate') {
          const pieTags = this.pieContentModel.elements && Object.keys(this.pieContentModel.elements)
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
    if (this.stimulusItemModel) {
      return this.renderStimulus ? (
        <pie-stimulus-layout allowedResize={this.allowedResize}>
          <div slot="stimulus" class='player-stimulus-container'>
            <pie-player
              id="stimulusPlayer"
              config={this.stimulusItemModel.passage}
              env={this.env}
              hosted={this.hosted}
              session={this.session}
              ref={el => (this.stimulusPlayer = el as HTMLElement)}
              bundleHost={this.bundleHost}
            />
          </div>
          <div slot="item" class='player-item-container'>
            <pie-player
              id="itemPlayer"
              addCorrectResponse={this.addCorrectResponse}
              config={this.stimulusItemModel.pie}
              env={this.env}
              hosted={this.hosted}
              session={this.session}
              bundleHost={this.bundleHost}
            />
          </div>
        </pie-stimulus-layout>
      ) : (
        <pie-player
          id="itemPlayer"
          addCorrectResponse={this.addCorrectResponse}
          config={this.stimulusItemModel.pie}
          env={this.env}
          hosted={this.hosted}
          session={this.session}
        />
      );
    } else {
      if (this.elementsLoaded) {
        return (
          <div class='player-container'
            innerHTML={
              this.pieContentModel && this.pieContentModel.markup
                ? this.pieContentModel.markup
                : ""
            }
          />
        );
      }

      return <pie-spinner/>;
    }
  }
}

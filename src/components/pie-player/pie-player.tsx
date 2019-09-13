import {
  Component,
  Prop,
  Watch,
  State,
  Element,
  Event,
  EventEmitter,
  Method,
  h
} from '@stencil/core';
import {
  PieContent,
  ItemConfig,
  ItemSession,
  PieElement,
  PieController,
  AdvancedItemConfig,
  PieModel
} from '../../interface';
import { PieLoader } from '../../pie-loader';
import { addRubric } from '../../rubric-utils';
import {SessionChangedEvent} from '@pie-framework/pie-player-events';

const controllerErrorMessage: string =
  'Error processing question configuration, verify the question model?';

@Component({
  tag: 'pie-player',
  styleUrl: '../components.css',
  shadow: false
})
export class Player {
  /**
   * a reference to the active player when wrapping playert in stimulus layout
   */
  stimulusPlayer: HTMLElement;

  _loadCompleteState: boolean = false;

  @Prop({ context: 'document' }) doc!: Document;

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
  @Event({ eventName: 'session-changed' }) sessionChanged: EventEmitter;

  /**
   * Emmitted if there is an error encountered while rendering.
   * `event.detail` will be a string containing a message about the error.
   */
  @Event({ eventName: 'player-error' }) playerError: EventEmitter;

  /**
   * TODO - Emmitted when any all interactions in a PIE Assessment Item have reported that a user
   * has provided a response to the interaction.
   */
  @Event() responseCompleted: EventEmitter;

  /**
   * Emitted when the content in the config has been loaded.
   */
  @Event({ eventName: 'load-complete' }) loadComplete: EventEmitter;

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

  @Watch('addCorrectResponse')
  watchAddCorrectResponse(newValue, oldValue) {
    if (newValue !== oldValue) {
      this.updateModels();
    }
  }

  /**
   * The Pie Session
   */
  @Prop() session: ItemSession = { id: '', data: [] };

  /**
   * Describes runtime environment for the player.
   *
   */
  @Prop() env: Object = { mode: 'gather', role: 'student' };

  /**
   * Indicates if player running in the context of a PIE hosting system.
   * Do not modify the default value for this property if you are not implementing a PIE host.
   * If true, the host is responsible for all model updates.
   */
  @Prop() hosted?: boolean = false;

  /**
   * If provided this url is used for loading the JS bundle for rendering the PIE Elements.
   * If not provided the system will default to using the PIE Cloud service to locate and load JS bundles.
   */
  @Prop() jsBundleUrls?: string[];

  /**
   * If the item contains a stimulus, the player will render it by default.
   * Set this property to false to not render stimulus.
   */
  @Prop() renderStimulus: boolean = true;

  @State() pieContentModel: PieContent;

  @State() stimulusItemModel: AdvancedItemConfig;

  pieLoader = new PieLoader();

  player() {
    return this.stimulusPlayer ? this.stimulusPlayer : this;
  }

  @Watch('config')
  async watchConfig(newConfig) {
    this.elementsLoaded = false;
    this._loadCompleteState = false;
    // wrapping a player in stimulus layoute
    if (this.stimulusPlayer) {
      (this.stimulusPlayer as any).config = newConfig;
      return;
    }
    try {
      if (!newConfig) {
        return;
      }
      try {
        if (typeof newConfig == 'string') {
          newConfig = JSON.parse(newConfig);
        }
        if (newConfig.pie) {
          this.stimulusItemModel = newConfig;
          return; // if stimulus item
        } else if (newConfig.elements) {
          this.pieContentModel = addRubric(newConfig);
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

      if (!this.elementsLoaded) {
        if (this.jsBundleUrls) {
          await this.pieLoader.loadJs(this.jsBundleUrls, this.doc);
          await this.pieLoader.defineElements(this.pieContentModel.elements);
        } else {
          await this.pieLoader.loadCloudPies(
            this.pieContentModel.elements,
            this.doc
          );
        }
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

  @Watch('env')
  updateModels(newEnv = this.env) {
    // wrapping a player in stimulus layoute
    if (this.stimulusPlayer) {
      (this.stimulusPlayer as any).env = newEnv;
      return;
    }

    if (
      this.pieContentModel &&
      this.pieContentModel.models &&
      this.pieContentModel.markup &&
      this.elementsLoaded
    ) {
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
                  typeof controller.createCorrectResponseSession ===
                    'function'
                ) {
                  session = controller.createCorrectResponseSession(
                    model,
                    newEnv
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
              this.playerError.emit(`add-correct-response cannot be used in hosted environement`);
            }
          }
          // by setting session we will trigger session-changed from PIE
          // block this event, and set/emit load complete on receipt to not block future events
          pieEl.addEventListener(SessionChangedEvent.TYPE, ev => {
            if (!this._loadCompleteState) {
              ev.stopPropagation();
              if ((this.pieContentModel.models.length)  === (index +1)) {
                this._loadCompleteState = true;
                this.loadComplete.emit();
              }      
            }
          });
          pieEl.session = session;
        }
      });
    }
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
    const ss = { id };
    data.push(ss);
    return ss;
  }

  async afterRender() {
    if (
      this.pieContentModel &&
      this.pieContentModel.markup
    ) {
      if (this.elementsLoaded) {
        this.updateModels();
      } else {
        // Note: hard to verify but it appears that we need to resolve
        // the value first rather than setting the promise directly on
        // this state property - otherwise lifecycle re-render is triggered too early
        const loaded = await this.pieLoader.elementsHaveLoaded(this.el);
        this.elementsLoaded = loaded;
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
        <pie-stimulus-layout>
          <div slot="stimulus">
            <pie-player
              id="stimulusPlayer"
              config={this.stimulusItemModel.stimulus}
              env={this.env}
              hosted={this.hosted}
              jsBundleUrls={this.jsBundleUrls}
              session={this.session}
            />
          </div>
          <div slot="item">
            <pie-player
              id="itemPlayer"
              config={this.stimulusItemModel.pie}
              env={this.env}
              hosted={this.hosted}
              jsBundleUrls={this.jsBundleUrls}
              session={this.session}
              ref={el => (this.stimulusPlayer = el as HTMLElement)}
            />
          </div>
        </pie-stimulus-layout>
      ) : (
        <pie-player
          id="itemPlayer"
          config={this.stimulusItemModel.pie}
          env={this.env}
          hosted={this.hosted}
          jsBundleUrls={this.jsBundleUrls}
          session={this.session}
        />
      );
    } else {
      return (
        <pie-spinner active={!this.elementsLoaded}>
          <div
            innerHTML={
              this.pieContentModel && this.pieContentModel.markup
                ? this.pieContentModel.markup
                : ''
            }
          />
        </pie-spinner>
      );
    }
  }
}

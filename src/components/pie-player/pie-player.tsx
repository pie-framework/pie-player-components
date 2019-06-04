import {
  Component,
  Prop,
  Watch,
  State,
  Element,
  Event,
  EventEmitter,
  Method
} from '@stencil/core';
import { PieContent, ItemConfig, ItemSession, PieElement, PieController, AdvancedItemConfig, PieModel} from '../../interface';
import { PieLoader } from '../../pie-loader';

const controllerErrorMessage: string = 'Error processing question configuration, verify the question model?';

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

  @Prop({ context: 'document' }) doc!: Document;

  @Element() el: HTMLElement;

  // Note - the below not handled, just added here for API docs
  /**
   * Emmitted when any interaction in the set of interactions being rendered has
   * been mutated by user action.
   */
  @Event({eventName: 'session-changed'}) sessionChanged: EventEmitter;

  /**
   * Emmitted if there is an error encountered while rendering.
   * `event.detail` will be a string containing a message about the error.
   */
  @Event({eventName: 'player-error'}) playerError: EventEmitter;

  /**
   * TODO - Emmitted when any all interactions in a PIE Assessment Item have reported that a user 
   * has provided a response to the interaction. 
   */
  @Event() responseCompleted: EventEmitter;

  @State() elementsLoaded: boolean = false;

  /**
   * The Pie config model.
   */
  @Prop() config: ItemConfig;

  /**
   * The Pie Session
   */
  @Prop() session: ItemSession = {id: "", data:[]};

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


  @State() pieContentModel: PieContent;

  @State() stimulusItemModel: AdvancedItemConfig;

  pieLoader = new PieLoader();

  player() {
   return this.stimulusPlayer ? this.stimulusPlayer : this;
  }

  @Watch('config')
  async watchConfig(newConfig) {
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
        if (typeof newConfig == 'string')  {
          newConfig = JSON.parse(newConfig);
        }
        if (newConfig.pie) {
          this.stimulusItemModel = newConfig;
          return; // if stimulus item 
        } else if (newConfig.elements)  {
          this.pieContentModel = newConfig
        } else {
          this.playerError.emit(`invalid pie data model`);
          return;
        }
      } catch (err) {
        this.playerError.emit(`exception processing content model - ${err.message}`);
        return;  
      }

      if (!this.elementsLoaded) {
        this.el.innerHTML = this.pieContentModel.markup;
        if (this.jsBundleUrls) {
          await this.pieLoader.loadJs(this.jsBundleUrls, this.doc);
          await this.pieLoader.defineElements(this.pieContentModel.elements);
        } else {
          await this.pieLoader.loadCloudPies(this.pieContentModel.elements, this.doc);
        }
        this.elementsLoaded = await this.pieLoader.elementsHaveLoaded(this.el);
      }
      this.updateModels();
    } catch (err) {
      this.playerError.emit(`problem loading item (${err})`)
    }
  }

  @Watch('elementsLoaded')
  watchElementsLoaded(newValue: boolean, oldValue: boolean) {
    if (newValue && !oldValue) {
      this.updateModels();
    }
  }


  /**
   * For previewing changes to an item. Updates the model for one question in the item model.
   * @param update the updated model
   */
  @Method()
  async updateElementModel(update: PieModel) {
    if (this.pieContentModel && this.pieContentModel.models)  {
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
    if (this.pieContentModel && this.pieContentModel.models) {
      this.pieContentModel.models.forEach(async model => {
        const pieEl: PieElement = this.el.querySelector(`[id='${model.id}']`);   
        const session = this.findOrAddSession(this.session.data, model.id);
        pieEl.session = session;
        if (pieEl) {
          if (!this.hosted) {
            try {
              // use local controllers
              const controller: PieController = this.pieLoader.getController(
                pieEl.localName
              );
              if (controller) {
                pieEl.model = await controller.model(model, session, newEnv);
              } else  {
                // no controller provided
                pieEl.model = model;
              }
            } catch (err) {
              this.playerError.emit(`${controllerErrorMessage}  -  (${err})`);
            }
          } else {
            if ((model as any).error) {
              this.playerError.emit(`${controllerErrorMessage}  -  '${(model as any).error}'`);
            }
            pieEl.model = model;           
          }
          
        };   
      });
    }
  }

  async componentWillLoad() {
    await this.watchConfig(this.config);
  }

  findOrAddSession(data: any[], id: string) {
    const s = data.find(d => d.id === id);
    if (s) {
      return s;
    }
    const ss = { id };
    data.push(ss);
    return ss;
  };

  render() {
    console.log(`render called on player`)
    if (this.stimulusItemModel) {
      return  <pie-stimulus-layout>
        <div slot="stimulus">
          <pie-player 
            id="stimulusPlayer" 
            config={this.stimulusItemModel.stimulus}
            hosted={this.hosted}
            jsBundleUrls={this.jsBundleUrls}
            session={this.session}
            ></pie-player>
        </div>
        <div slot="item">
          <pie-player 
            id="itemPlayer" 
            config={this.stimulusItemModel.pie}
            hosted={this.hosted}
            jsBundleUrls={this.jsBundleUrls}
            session={this.session}
            ref={(el) => this.stimulusPlayer = el as HTMLElement}
            ></pie-player>
        </div>
      </pie-stimulus-layout>
    } else {
      if (this.pieContentModel && !this.elementsLoaded) {
        return <pie-spinner></pie-spinner>
      } else {
        return <div innerHTML={(this.pieContentModel && this.pieContentModel.markup) ? this.pieContentModel.markup : ""} />;
      }
    }

  }

}

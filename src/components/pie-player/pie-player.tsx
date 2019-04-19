import {
  Component,
  Prop,
  Watch,
  State,
  Element,
  Event,
  EventEmitter
} from '@stencil/core';
import { PieContent, ItemConfig, ItemSession, PieElement, PieController} from '../../interface';
import { PieLoader } from '../../pie-loader';
import { pieContentFromConfig } from '../../utils/utils';

const controllerErrorMessage: string = 'Error processing question configuration, verify the question model?';
@Component({
  tag: 'pie-player',
  styleUrl: '../components.css',
  shadow: false
})
export class Player {
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

  pieLoader = new PieLoader();

  @Watch('config')
  async watchConfig(newConfig) {
    if (!newConfig) {
      return;
    }
    this.pieContentModel = pieContentFromConfig(newConfig);
    if (!this.elementsLoaded) {
      this.el.innerHTML = this.pieContentModel.markup;
      if (this.jsBundleUrls) {
        await this.pieLoader.loadJs(this.jsBundleUrls, this.doc);
        await this.pieLoader.defineElements(this.pieContentModel.elements);
      } else {
        await this.pieLoader.loadCloudPies(this.pieContentModel.elements, this.doc);
      }
      this.elementsLoaded = await this.pieLoader.elementsHaveLoaded(this.el);
    } else {
      this.updateModels();
    }
  }

  @Watch('elementsLoaded')
  watchElementsLoaded(newValue: boolean, oldValue: boolean) {
    if (newValue && !oldValue) {
      this.updateModels();
    }
  }

  @Watch('env')
  updateModels() {
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
              pieEl.model = await controller.model(model, session, this.env);
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
    this.watchConfig(this.config);
  }

  render() {
    return <div innerHTML={(this.pieContentModel && this.pieContentModel.markup) ? this.pieContentModel.markup : ""} />;
  }

  hostData() {
    return {
      'class': { 'pie-loading': (this.pieContentModel && !this.elementsLoaded) }
    };
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

}

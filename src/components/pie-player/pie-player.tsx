import {
  Component,
  Prop,
  Watch,
  State,
  Element,
  Event,
  EventEmitter,
  Listen
} from '@stencil/core';
import { PieContent, ItemConfig, ItemSession, PieElement, PieController} from '../../interface';
import { PieLoader } from '../../pie-loader';
import { pieContentFromConfig } from '../../utils/utils';
// const  nanoid = require('nanoid');
import {
  SessionChangedEvent
} from '@pie-framework/pie-player-events';

@Component({
  tag: 'pie-player',
  shadow: false
})
export class Player {
  @Prop({ context: 'document' }) doc!: Document;

  @Element() el: HTMLElement;

  /**
   * Emmitted when any interaction in the set of interactions being rendered has
   * been mutated by user action.
   */
  @Event() sessionChanged: EventEmitter;

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

  @State() pieContentModel: PieContent;

  pieLoader = new PieLoader();

  @Watch('config')
  async watchConfig(newConfig) {
    this.pieContentModel = pieContentFromConfig(newConfig);
    if (!this.elementsLoaded) {
      this.el.innerHTML = this.pieContentModel.markup;
      await this.pieLoader.loadCloudPies(this.pieContentModel.elements, this.doc);
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

  updateModels() {
    this.pieContentModel.models.forEach(async model => {
      const pieEl: PieElement = this.el.querySelector(`[id='${model.id}']`);
      const controller: PieController = this.pieLoader.getController(
        pieEl.localName
      );
      pieEl.session =  this.findOrAddSession(this.session.data, model.id);
      pieEl.model = await controller.model(model, pieEl.session, this.env);
    });
  }

  componentWillLoad() {
    this.watchConfig(this.config);
  }

  async componentDidLoad() {
    this.elementsLoaded = await this.pieLoader.elementsHaveLoaded(this.el);
  }

  render() {
    return <div innerHTML={this.pieContentModel.markup} />;
  }

  hostData() {
    return {
      'class': { 'pie-loading': !this.elementsLoaded }
    };
  }

  /**
   * TODO - just wrapping the underlying PIE events for now, and exposing a player-level api.
   * Should get the `completed` flags and combine them to get an overall session completed 
   * status, or emit a completed event. 
   * 
   */
  @Listen('session-changed') // TODO - can't use SessionChanvedEvent.TYPE ?
  handleSessionUpdate(ev: SessionChangedEvent){
    ev.stopPropagation();
    this.sessionChanged.emit(this.session);
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

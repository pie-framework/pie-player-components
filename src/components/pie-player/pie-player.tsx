import { Component, Prop, Watch, State, Element } from '@stencil/core';
import { PieContent, ItemConfig } from '../../interface';
import { PieLoader } from '../../pie-loader';
import { pieContentFromConfig } from '../../utils/utils';
import {
  SessionChangedEvent
} from '@pie-framework/pie-player-events';

interface PieElement extends HTMLElement {
  _model: Object,
  model: Object;
  configure: Object,
  _configure: Object,
  session: Object;
  onModelChanged: Function;
}


type PieController = {
  model: (config: Object, session: Object, env: Object) => Promise<Object>;
  score: (config: Object, session: Object, env: Object) => Promise<Object>;
};



/**
 * Pie Player loads Pie Content and implements the Pie Player Api
 */
@Component({
  tag: 'pie-player',
  shadow: false
})
export class Player {


  @Prop({ context: 'document' }) doc!: Document;

  @Element() el: HTMLElement;

  @State() elementsLoaded: boolean = false;

  /**
   * The Pie config model.
   */
  @Prop() config: ItemConfig;

  /**
   * The Pie Session
   */
  @Prop() session: Object = {};

  /**
   * Describes runtime environment for the player.
   * 
   */
  @Prop() env: Object = { mode: 'gather', role: 'student' };

  @State() pieContentModel: PieContent;

  @Watch('config')
  watchConfig(newConfig) {
    console.log(`watch config called`);
    this.pieContentModel = pieContentFromConfig(newConfig);
    if (!this.elementsLoaded) {
      this.el.innerHTML = this.pieContentModel.markup;
      PieLoader.loadCloudPies(this.pieContentModel.elements, this.doc);
    } else {
      this.updateModels();
    }  
    
  }

  @Watch('elementsLoaded')
  watchElementsLoaded(newValue: boolean, oldValue: boolean) {
    if (newValue && !oldValue)  {
      this.updateModels();
    }
  }

  updateModels() {
    this.pieContentModel.models.map(async model => {
      const pieEl: PieElement = this.el.querySelector(`[id='${model.id}']`);
      const controller : PieController = PieLoader.getController(pieEl.localName);
      const session = this.session[model.id] = pieEl.session ? pieEl.session : {};
      pieEl.session = session;
      pieEl.model = await controller.model(model,session,this.env);
    });
  }

  addListeners() {
    this.pieContentModel.models.map(async model => {
      const pieEl: PieElement = this.el.querySelector(`[id='${model.id}']`);
      pieEl.addEventListener(SessionChangedEvent.TYPE, (event: SessionChangedEvent) => {
        event.detail.
      });
    });
  }

  componentWillLoad(){
    this.watchConfig(this.config);
    // get item model
    // find out if elements are registered yet for the config pies
  }

  async componentDidLoad() {
    
    const undefinedElements = this.el.querySelectorAll(':not(:defined)');
    console.log(`undefinedElements --- ${undefinedElements.length}`);
    const promises = [...undefinedElements].map(
      e => customElements.whenDefined(e.localName)
    );
    await Promise.all(promises);
    this.elementsLoaded = true;
    console.log(`undefinedElements loaded ${this.el.querySelectorAll(':not(:defined)').length}`);
  }

  render() {
    return <div innerHTML={this.pieContentModel.markup}></div>;
  }
}

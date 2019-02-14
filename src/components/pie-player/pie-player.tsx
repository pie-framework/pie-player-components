import { Component, Prop, Watch, State, Element } from '@stencil/core';
import { PieContent, ItemConfig } from '../../interface';
import { PieLoader } from '../../pie-loader';
import { pieContentFromConfig } from '../../utils/utils';



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
    PieLoader.updateModels(this.pieContentModel.models, this.el, this.env);
  }

  componentWillLoad(){
    this.watchConfig(this.config);
  }

  async componentDidLoad() {
    this.elementsLoaded = await PieLoader.elementsHaveLoaded(this.el);    
  }

  render() {
    return <div innerHTML={this.pieContentModel.markup}></div>;
  }
}

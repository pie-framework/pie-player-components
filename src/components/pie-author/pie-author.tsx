import { Component, Element, Prop, State, Watch } from '@stencil/core';
import { PieContent, ItemConfig, PieElement } from '../../interface';
import { PieLoader } from '../../pie-loader';
import { pieContentFromConfig } from '../../utils/utils';

/**
 * Pie Author will load a Pie Content model for authoring.
 * It needs to be run in the context
 */
@Component({
  tag: 'pie-author',
  shadow: false // shadow dom causes material ui problem
})
export class Author {
  @Prop({ context: 'document' }) doc!: Document;

  @Element() el: HTMLElement;

  @State() elementsLoaded: boolean = false;

  /**
   * The Pie config model.
   */
  @Prop() config: ItemConfig;


  @State() pieContentModel: PieContent;

  pieLoader = new PieLoader();

  @Watch('config')
  watchConfig(newConfig) {
    if (newConfig) {
      this.pieContentModel = pieContentFromConfig(newConfig);
      this.pieContentModel = this.pieLoader.convertPieContent(this.pieContentModel);

      if (!this.elementsLoaded) {
        this.pieLoader.loadCloudPies(this.pieContentModel.elements, this.doc);
      } else {
        this.updateModels();
      }
    }
  }

  @Watch('elementsLoaded')
  watchElementsLoaded(newValue: boolean, oldValue: boolean) {
    if (newValue && !oldValue) {
      this.updateModels();
    }
  }

  updateModels() {
    this.pieContentModel.models.map(async model => {
      const pieEl: PieElement = this.el.querySelector(`[id='${model.id}']`);
      pieEl.model = model;
    });
  }

  componentWillLoad() {
    this.watchConfig(this.config);
  }

  async componentDidLoad() {
    this.elementsLoaded = await this.pieLoader.elementsHaveLoaded(this.el);
  }

  hostData() {
    return {
      'class': { 'pie-loading': !this.elementsLoaded }
    };
  }
  render() {
    return <div innerHTML={this.pieContentModel.markup} />;
  }
}

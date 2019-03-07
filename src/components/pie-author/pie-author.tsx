import { Component, Element, Prop, State, Watch, Method } from '@stencil/core';
import { PieContent, ItemConfig, PieElement } from '../../interface';
import { PieLoader } from '../../pie-loader';
import { pieContentFromConfig } from '../../utils/utils';
import parseNpm from 'parse-package-name';

// TODO - remove temporary polyfills
import { createConfigFunctions } from '../../polyfill-elements';

/**
 * Pie Author will load a Pie Content model for authoring.
 * It needs to be run in the context
 */
@Component({
  tag: 'pie-author',
  styleUrl: '../components.css',
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
  async watchConfig(newConfig) {
    if (newConfig) {
      try {
        this.elementsLoaded = false;
        this.pieContentModel = pieContentFromConfig(newConfig);
        this.pieContentModel = this.pieLoader.convertPieContent(
          this.pieContentModel
        );
      } catch (error) {
        console.log(`ERROR ${error}`);
      }
    }
  }

  @Watch('elementsLoaded')
  watchElementsLoaded(newValue: boolean, oldValue: boolean) {
    if (
      newValue &&
      !oldValue &&
      this.pieContentModel &&
      this.pieContentModel.markup
    ) {
      this.updateModels();
    }
  }

  updateModels() {
    if (
      this.pieContentModel &&
      this.pieContentModel.elements &&
      this.pieContentModel.markup
    ) {
      if (!this.pieContentModel.models) {
        this.pieContentModel.models = [];
      }
      const tempDiv = this.doc.createElement('div');
      tempDiv.innerHTML = this.pieContentModel.markup;
      const elsWithId = tempDiv.querySelectorAll('[id]');
      // set up a model for each pie defined in the markup
      elsWithId.forEach(el => {
        const pieElName = el.tagName.toLowerCase().split('-config')[0];

        // this is a pie?
        if (this.pieContentModel.elements[pieElName]) {
          const packageName = parseNpm(this.pieContentModel.elements[pieElName])
            .name;

          const controller: any = this.pieLoader.getController(pieElName);
          const elementId = el.getAttribute('id');
          // TODO - remove polyfill
          // when removing polyfill should replace result with {} if no func defined on controller.s
          const hasFunc =
            controller &&
            controller.createConfig &&
            typeof controller.createConfig === 'function';
          const createModelFunc = hasFunc
            ? controller.createConfig
            : createConfigFunctions[packageName];
          const currentModel =
            this.pieContentModel && this.pieContentModel.models
              ? this.pieContentModel.models.find(m => m.id === elementId)
              : {};

          const model = createModelFunc(currentModel);
          model.id = elementId;
          model.element = pieElName;
          this.pieContentModel.models.push(model);
        }
      });
      tempDiv.remove();
    }
    if (this.pieContentModel && this.pieContentModel.models) {
      this.pieContentModel.models.map(async model => {
        const pieEl: PieElement = this.el.querySelector(`[id='${model.id}']`);
        if (pieEl) {
          pieEl.model = model;
        }
      });
    }
  }

  async componentWillLoad() {
    this.elementsLoaded = await this.pieLoader.elementsHaveLoaded(this.el);
    this.watchConfig(this.config);
  }

  async componentDidLoad() {
    this.loadPieElements();
  }

  async componentDidUpdate() {
    this.loadPieElements();
  }

  async loadPieElements() {
    if (this.config) {
      await this.pieLoader.loadCloudPies(
        this.pieContentModel.elements,
        this.doc
      );
      this.elementsLoaded = await this.pieLoader.elementsHaveLoaded(this.el);
    }
  }

  hostData() {
    return {
      class: { 'pie-loading': !this.elementsLoaded }
    };
  }
  render() {
    if (this.pieContentModel && this.pieContentModel.markup) {
      return <div innerHTML={this.pieContentModel.markup} />;
    }
  }
}

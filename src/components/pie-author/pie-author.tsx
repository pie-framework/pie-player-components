import { Component, Element, Prop, State, Watch, Event, EventEmitter } from '@stencil/core';
import { PieContent, ItemConfig, PieElement } from '../../interface';
import { PieLoader } from '../../pie-loader';
import { pieContentFromConfig } from '../../utils/utils';
import parseNpm from 'parse-package-name';
import { ModelUpdatedEvent } from '@pie-framework/pie-configure-events';
import _isEqual from 'lodash/isEqual';

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

  @Prop() addPreview: boolean;

  @Element() el: HTMLElement;

  @State() elementsLoaded: boolean = false;

  /**
   * The Pie config model.
   */
  @Prop() config: ItemConfig;


  /**
   * Emmitted when the model for the content has been updated in the ui.
   */
  @Event() modelUpdated: EventEmitter;

  /**
   * To customize the standard behaviour provided by interaction configuration views you can 
   * provide settings key-ed by the package name.  e.g.
   * 
   * `{ '@pie-element/inline-choice': { promptLabel: 'Item Stem' } }`
   * 
   * The settings that are configurable for each authoring view are documented in 
   * the `@package-name/docs` folder for each package.
   */
  @Prop() configSettings?: {[packageName:string]:Object}

  pieContentModel: PieContent;

  pieLoader = new PieLoader();

  renderMarkup: String;

  getRenderMarkup(): string {
    let markup = this.pieContentModel ? this.pieContentModel.markup : "";
    if (markup) {
      Object.keys(this.pieContentModel.elements).forEach(key => {
        markup = markup.split(key).join( key+'-config');
      });
      return markup;
    }
  }

  @Watch('config')
  async watchConfig(newValue, oldValue) {
    
    if (newValue && !_isEqual(newValue,oldValue)) { 
      try {
        this.elementsLoaded = false;
        this.pieContentModel = pieContentFromConfig(newValue);
        this.addConfigTags(this.pieContentModel);
      } catch (error) {
        console.log(`ERROR ${error}`);
      }
      
    }
  }

  addConfigTags(c: PieContent) {
    if (!c.markup && c.models) {
      const tags = c.models.map(model => {
        return `<${model.element} id="${model.id}"></${
          model.element
        }-config>`;
      });
      c.markup = tags.join('');
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
        // initialize emtpy model if this is a pie
        if (this.pieContentModel.elements[pieElName]) {
          const elementId = el.getAttribute('id');
          if (!this.pieContentModel.models.find(m => m.id === elementId)) {
            const model = {id: elementId, element: pieElName};
            this.pieContentModel.models.push(model);
          }  
        }
      });
      tempDiv.remove();
    }
    if (this.pieContentModel && this.pieContentModel.models) {
      this.pieContentModel.models.map(model => {
        let pieEl: PieElement = this.el.querySelector(`[id='${model.id}']`);
        !pieEl && (pieEl = this.el.querySelector(`[pie-id='${model.id}']`));
        
        if (pieEl) {
          const pieElName = pieEl.tagName.toLowerCase().split('-config')[0];
          const packageName = parseNpm(this.pieContentModel.elements[pieElName])
              .name;
          pieEl.model = model;
          if (this.configSettings && this.configSettings[packageName]) {
            pieEl.configure = this.configSettings[packageName]
          }
        }
      });
    }
  }

  async componentWillLoad() {
    if (this.config) {
      this.elementsLoaded = await this.pieLoader.elementsHaveLoaded(this.el);
      this.updateModels();
    }
    this.watchConfig(this.config, {});
  }

  async componentDidLoad() {
    this.el.addEventListener(ModelUpdatedEvent.TYPE, (e:ModelUpdatedEvent) =>  {
      // set the internal model
      // emit a content-item level event with the model
      if (this.pieContentModel && e.update) {
        this.pieContentModel.models.forEach(m => {
          if (m.id === e.update.id) {
            Object.assign(m, e.update);
          }
        });
        // e.stopPropagation();
        console.log(`emitting model updated`);
        this.modelUpdated.emit(this.pieContentModel)
      }  
    });

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
      this.updateModels();
    }
  }

  render() {
    if (this.pieContentModel && this.pieContentModel.markup) {
      if (this.addPreview) {
        return <pie-preview-layout config={this.config} >
          <div slot="configure" innerHTML={this.getRenderMarkup()} />
        </pie-preview-layout>
      } else {
        return <div innerHTML={this.getRenderMarkup()} />;
      }
    } else {
      return <pie-spinner></pie-spinner>;
    }
  }
}

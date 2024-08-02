import {
  Component,
  Element,
  Prop,
  State,
  Watch,
  Event,
  EventEmitter,
  Method,
  h
} from "@stencil/core";

import { _dll_pie_lib__pie_toolbox_math_rendering_accessible } from "@pie-lib/pie-toolbox-math-rendering-module/module";

import {PieContent, ItemConfig, PieElement, PieModel, PieController} from "../../interface";
import {
  PieLoader,
  BundleEndpoints,
  DEFAULT_ENDPOINTS
} from "../../pie-loader";
import {createTag, pieContentFromConfig} from "../../utils/utils";
import parseNpm from "parse-package-name";
import _isEqual from "lodash/isEqual";
import _isEmpty from "lodash/isEmpty";
import {
  addComplexRubric,
  addMultiTraitRubric,
  addPackageToContent,
  addRubric,
  removeComplexRubricFromMarkup,
  COMPLEX_RUBRIC,
  complexRubricChecks, addModelToContent
} from "../../rubric-utils";

import {
  ModelUpdatedEvent,
  InsertImageEvent,
  DeleteImageEvent,
  InsertSoundEvent,
  DeleteSoundEvent,
  ImageHandler
} from "@pie-framework/pie-configure-events";
import {
  DataURLImageSupport,
  ExternalImageSupport
} from "./dataurl-image-support";
import {
  DataURLUploadSoundSupport,
  ExternalUploadSoundSupport
} from "./dataurl-upload-sound-support";
import {VERSION} from "../../version";
import cloneDeep from "lodash/cloneDeep";

/**
 * Pie Author will load a Pie Content model for authoring.
 * It needs to be run in the context
 */
@Component({
  tag: "pie-author",
  styleUrl: "../components.css",
  shadow: false // shadow dom causes material ui problem
})
export class Author {
  _modelLoadedState: boolean = false;

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

  /**
   * If set the player will add a rubric authoring interaction to the config
   */
  @Prop() addRubric: boolean;

  /**
   * Adds a preview view which will render the content in another tab as it may appear to a student or instructor.
   */
  @Prop() addPreview: boolean = false;

  @Element() el: HTMLElement;

  @State() elementsLoaded: boolean = false;

  /**
   * The Pie config model.
   */
  @Prop() config: ItemConfig;

  /**
   * Emmitted when the model for the content has been updated within the ui due to user action.
   */
  @Event() modelUpdated: EventEmitter;

  /**
   * Emmitted when the content models in the config have been set on the content
   */
  @Event() modelLoaded: EventEmitter;

  /**
   * To customize the standard behaviour provided by interaction configuration views you can
   * provide settings key-ed by the package name.  e.g.
   *
   * `{ '@pie-element/inline-choice': { promptLabel: 'Item Stem' } }`
   *
   * The settings that are configurable for each authoring view are documented in
   * the `@package-name/docs` folder for each package.
   */
  @Prop() configSettings?: { [packageName: string]: Object };

  /**
   * To provide a way to add a default model to complex-rubric
   */
  @Prop() defaultComplexRubricModel?: Object;

  /**
   * If pie-author is used inside pie-api-author component. Do not set it manually.
   */
  @Prop() isInsidePieApiAuthor?: boolean = false;

  pieContentModel: PieContent;

  pieLoader = new PieLoader();

  renderMarkup: String;

  @State() fileInput: any = null;

  imageHandler: ImageHandler = null;

  handleFileInputChange: (e: Event) => void;
  handleInsertImage: (e: InsertImageEvent) => void;
  handleDeleteImage: (e: DeleteImageEvent) => void;
  handleInsertSound: (e: InsertSoundEvent) => void;
  handleDeleteSound: (e: DeleteSoundEvent) => void;
  handleSetConfigElement: (e: CustomEvent) => void;

  /** external providers can set this if they need to upload the assets to the cloud etc. by default we use data urls */
  @Prop({reflect: false})
  imageSupport: ExternalImageSupport = new DataURLImageSupport();

  /** external providers can set this if they need to upload the assets to the cloud etc. by default we use data urls */
  @Prop({reflect: false})
  uploadSoundSupport: ExternalUploadSoundSupport = new DataURLUploadSoundSupport();

  @Prop({mutable: false, reflect: false})
  version: string = VERSION;

  /**
   * used in our demo environment to allow author to watch config settings and make updates
   * defaults to false (do not set it to true because it was not tested properly)
   * @type {boolean}
   * @private
   */
  @Prop() canWatchConfigSettings: boolean = false;

  /**
   * used to automatically re-fetch the bundle (in case we get a 503)
   */
  @Prop() reFetchBundle?: boolean = false;

  @Method()
  async validateModels() {
    if (!this.pieContentModel || !this.pieContentModel.models) {
      console.error('No pie content model');

      return {hasErrors: false, validatedModels: {}};
    }

    return (this.pieContentModel.models || []).reduce((acc: any, model, index) => {
      let pieEl: PieElement = this.el.querySelector(`[id='${model.id}']`);
      !pieEl && (pieEl = this.el.querySelector(`[pie-id='${model.id}']`));

      if (pieEl) {
        const pieElName = pieEl.tagName.toLowerCase().split("-config")[0];

        const controller: PieController = this.pieLoader.getController(pieElName);

        const packageName = parseNpm(this.pieContentModel.elements[pieElName]).name;
        const configuration = this.configSettings && this.configSettings[packageName] || {};

        if (controller && controller.validate) {
          // here we call controller.validate which returns an object with all the errors
          const errors = controller.validate(model, configuration);
          const errorsAreTheSame = _isEqual(model && model.errors, errors);

          // Only update models if anything changed to errors object, otherwise, we'll keep calling onModelUpdated and again validateModels
          // for complex items (like ebsr, complex-rubric, who are using other items)
          if (!errorsAreTheSame) {
            // added this to ensure that this.pieContentModel.model is updated with the correct errors
            // TODO: figure out what's actually happening and if there is a better way to make sure that this.pieContentModels.models is actually updated
            this.pieContentModel.models[index] = { ...model, errors };

            // here we can update the model in author, so we can set errors
            pieEl.model = { ...model, errors };
          }

          // for ebsr
          if (errors && errors.partA && errors.partB) {
            acc.hasErrors = acc.hasErrors || (!_isEmpty(errors.partA) || !_isEmpty(errors.partB));
          } else {
            // here we return a boolean value if models are valid or not
            acc.hasErrors = acc.hasErrors || !_isEmpty(errors);
          }

          acc.validatedModels = {
            ...acc.validatedModels,
            [model.id]: {
              ...model,
              errors,
            }
          };
        } else {
          acc.validatedModels = {
            ...acc.validatedModels,
            [model.id]: model,
          }
        }
      }

      return acc;
    }, { hasErrors: false, validatedModels: {} });
  }

  insertImage(file: File) {
    this.imageSupport.insert(
      file,
      (e: Error, src: string) => {
        if (e) {
          console.warn("error inserting image: ", e.message);
          console.error(e);
        }
        this.imageHandler.done(e, src);
        this.imageHandler = null;
      },
      (percent, bytes, total) =>
        this.imageHandler.progress(percent, bytes, total)
    );
  }

  constructor() {
    this.handleFileInputChange = (e: Event) => {
      const input = e.target;

      if (!this.imageHandler) {
        console.error("no image handler - but file input change triggered?");
        return;
      }

      const files: FileList = (input as any).files;
      if (files.length < 1 || !files[0]) {
        this.imageHandler.cancel();
        this.imageHandler = null;
      } else {
        const file: File = files[0];
        this.imageHandler.fileChosen(file);
        this.fileInput.value = "";
        this.insertImage(file);
      }
    };

    this.handleInsertImage = (e: InsertImageEvent) => {
      console.log("[handleInsertImage]", e);
      this.imageHandler = e.detail;

      if (!e.detail.isPasted) {
        this.fileInput.click();
      } else if (e.detail.getChosenFile) {
        // this is for images that were pasted into the editor (or dropped)
        // they also need to be uploaded, but the file input doesn't have to be used
        try {
          const file: File = e.detail.getChosenFile();

          if (file) {
            this.insertImage(file);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    this.handleDeleteImage = (e: DeleteImageEvent) => {
      console.log("[handleDeleteImage ..]", e);
      this.imageSupport.delete(e.detail.src, e.detail.done);
    };

    this.handleInsertSound = (e: InsertSoundEvent) => {
      console.log("[handleInsertSound]", e);
      this.uploadSoundSupport.insert(e.detail.fileChosen, e.detail.done)
    };

    this.handleDeleteSound = (e: DeleteImageEvent) => {
      console.log("[handleDeleteSound ..]", e);
      this.uploadSoundSupport.delete(e.detail.src, e.detail.done);
    };
  }

  getRenderMarkup(): string {
    let markup = this.pieContentModel ? this.pieContentModel.markup : "";
    if (markup) {
      Object.keys(this.pieContentModel.elements).forEach(key => {
        markup = markup.split(key).join(key + "-config");
      });
      return markup;
    }
  }

  isAdvancedItemConfig = (config: any): Boolean => config.pie;

  @Watch("config")
  async watchConfig(newValue, oldValue) {
    if (newValue && !_isEqual(newValue, oldValue)) {
      try {
        this.elementsLoaded = false;
        this._modelLoadedState = false;

        const pieContentModel = pieContentFromConfig(newValue);

        const complexRubricCheckedValues = complexRubricChecks(pieContentModel, this.configSettings);
        const {shouldAddComplexRubric, shouldRemoveComplexRubric} = complexRubricCheckedValues || {};

        // if changes are needed

        if (shouldAddComplexRubric || shouldRemoveComplexRubric) {
          this.pieContentModel = null;

          const newConfig = await this.getPieContentModelWithToggledComplexRubric({
            complexRubricCheckedValues,
            pieContentModel
          });

          // and then we reset the config
          if (newConfig) {
            this.config = this.getNewConfig(newConfig);
          }
        } else {
          // if there's no change needed, we can proceed with updating the config and loading pie-elements
          this.pieContentModel = pieContentModel;

          this.addConfigTags(this.pieContentModel);

          await this.loadPieElements();
        }
      } catch (error) {
        console.log(`ERROR ${error}`);
      }
    }
  }

  getPieContentModelWithToggledComplexRubric = async ({complexRubricCheckedValues, pieContentModel}) => {
    const {
      shouldAddComplexRubric,
      shouldRemoveComplexRubric,
      complexRubricElements
    } = complexRubricCheckedValues || {};

    if (shouldAddComplexRubric) {
      // we add complex-rubric to config
      return this.addComplexRubric(cloneDeep(pieContentModel));
    }

    if (shouldRemoveComplexRubric) {
      // we remove complex-rubric from config
      return this.removeComplexRubricItemTypes(cloneDeep(pieContentModel), complexRubricElements);
    }

    return null;
  }

  getNewConfig = (newConfig) => {
    if (this.isAdvancedItemConfig(this.config)) {
      return {
        ...this.config,
        pie: newConfig
      }
    }

    return newConfig;
  }

  async removeComplexRubricItemTypes(pieContentModel, rubricElements) {
    if (!rubricElements.length || !pieContentModel.models) {
      return pieContentModel;
    }

    // delete the complex-rubric elements from elements object
    rubricElements.forEach(rubricElementKey => delete pieContentModel.elements[rubricElementKey]);

    const {
      markupWithoutComplexRubric,
      deletedComplexRubricItemIds
    } = removeComplexRubricFromMarkup(pieContentModel, rubricElements, this.doc);

    // delete the complex-rubric nodes from markup
    pieContentModel.markup = markupWithoutComplexRubric;

    // delete the complex-rubric models
    pieContentModel.models = pieContentModel.models.filter(model => !deletedComplexRubricItemIds.includes(model.id));

    return pieContentModel;
  }

  async addComplexRubric(pieContentModel) {
    const complexRubricModel = {
      id: COMPLEX_RUBRIC,
      element: `pie-${COMPLEX_RUBRIC}`,
      // if there is a default model defined for complex-rubric, we have to use it
      ...this.defaultComplexRubricModel || {}
    };

    const packageName = `@pie-element/${COMPLEX_RUBRIC}`;

    // add complex-rubric in elements, IF it isn't there already
    let content = addPackageToContent(
      pieContentModel,
      packageName,
      complexRubricModel as PieModel
    );

    // but if complex-rubric is already in elements, then just add it in the models
    if (!content) {
      content = addModelToContent(
        pieContentModel,
        createTag(packageName),
        complexRubricModel as PieModel
      );
    }

    return addComplexRubric(content);
  }

  addConfigTags(c: PieContent) {
    if (!c.markup && c.models) {
      const tags = c.models.map(model => {
        return `<${model.element}-config id="${model.id}"></${
          model.element
        }-config>`;
      });
      c.markup = tags.join("");
    }
  }

  @Watch("elementsLoaded")
  async watchElementsLoaded(newValue: boolean, oldValue: boolean) {
    if (newValue && !oldValue) {
      await this.updateModels();
    }
  }

  async updateModels() {
    if (
      this.pieContentModel &&
      this.pieContentModel.elements &&
      this.pieContentModel.markup
    ) {
      if (!this.pieContentModel.models) {
        this.pieContentModel.models = [];
      }

      const tempDiv = this.doc.createElement("div");
      tempDiv.innerHTML = this.pieContentModel.markup;
      const elsWithId = tempDiv.querySelectorAll("[id]");

      // set up a model for each pie defined in the markup
      elsWithId.forEach(el => {
        const pieElName = el.tagName.toLowerCase().split("-config")[0];
        // initialize emtpy model if this is a pie
        if (this.pieContentModel.elements[pieElName]) {
          const elementId = el.getAttribute("id");
          if (!this.pieContentModel.models.find(m => m.id === elementId)) {
            const model = {id: elementId, element: pieElName};
            this.pieContentModel.models.push(model);
          }
        }
      });
      tempDiv.remove();
    }

    if (this.pieContentModel && this.pieContentModel.models) {
      this.setModelsAndConfigurations();

      if (this._modelLoadedState === false) {
        this._modelLoadedState = true;
        this.modelLoaded.emit(this.pieContentModel);
      }
    }
  }

  setModelsAndConfigurations = () => {
    if (this.pieContentModel && this.pieContentModel.models) {
      this.pieContentModel.models.map(model => {
        let pieEl: PieElement = this.el.querySelector(`[id='${model.id}']`);
        !pieEl && (pieEl = this.el.querySelector(`[pie-id='${model.id}']`));

        if (pieEl) {
          const pieElName = pieEl.tagName.toLowerCase().split("-config")[0];

          try {
            const packageName = parseNpm(this.pieContentModel.elements[pieElName]).name;
            pieEl.model = model;

            if (this.configSettings && this.configSettings[packageName]) {
              pieEl.configuration = this.configSettings[packageName];
            }

          } catch (e) {
            console.log(e.toString(), pieElName, this.pieContentModel.elements[pieElName]);
          }
        }
      });
    }
  }

  @Watch('configSettings')
  watchConfigSettings() {
    if (this.canWatchConfigSettings) {
      this.setModelsAndConfigurations();
    }
  }

  componentDidUnload() {
    this.el.removeEventListener(InsertImageEvent.TYPE, this.handleInsertImage);
    this.el.removeEventListener(DeleteImageEvent.TYPE, this.handleDeleteImage);

    this.el.removeEventListener(InsertSoundEvent.TYPE, this.handleInsertSound);
    this.el.removeEventListener(DeleteSoundEvent.TYPE, this.handleDeleteSound);

    if (this.fileInput) {
      this.fileInput.removeEventListener("change", this.handleFileInputChange);
    }
  }

  async componentWillLoad() {
    if (this.config) {
      this.watchConfig(this.config, {});
    }
    // Note: cannot use the @Listen decorator as creates bundling problems due
    // to `.` in event name.
    this.el.addEventListener(ModelUpdatedEvent.TYPE, async (e: ModelUpdatedEvent) => {
      // set the internal model
      // emit a content-item level event with the model
      let rubricChanged;

      if (this.pieContentModel && e.update) {
        this.pieContentModel.models.forEach(m => {
          if (m.id === e.update.id && m.element === e.update.element) {
            rubricChanged = rubricChanged || m.rubricEnabled !== e.update.rubricEnabled;

            Object.assign(m, e.update);

            if (e.update.errors && !_isEmpty(e.update.errors)) {
              this.validateModels();
            }
          }
        });
      }

      if (this._modelLoadedState) {
        if (rubricChanged) {
          if (this.isInsidePieApiAuthor) {
            // if pie-author is used inside pie-api-author, then what we need is to
            // calculate the new pieContentModel and make sure we emit the modelUpdated event with the updated pieContentModel

            // first thing, we check what changed (if we have to add or remove complex-rubric)
            const complexRubricCheckedValues = complexRubricChecks(this.pieContentModel, this.configSettings);
            const {shouldAddComplexRubric, shouldRemoveComplexRubric} = complexRubricCheckedValues || {};

            if (shouldAddComplexRubric || shouldRemoveComplexRubric) {
              // then, if changes are needed, we make them and save the new contentModel
              const newPieContentModel = await this.getPieContentModelWithToggledComplexRubric({
                complexRubricCheckedValues,
                pieContentModel: this.pieContentModel
              });

              // last thing to do is to make sure we send the updated pie content model to pie-api-author
              // (which listens for this event) who will trigger watchConfig
              if (newPieContentModel) {
                this.modelUpdated.emit(newPieContentModel);
              }
            }
          } else {
            // however, if we only use pie-player-components, just force the call to watchConfig
            await this.watchConfig(this.config, {});
          }
        } else {
          // if rubricEnabled did not change, just behave as previously
          // (pie-api-author listens for this event and triggers watchConfig)
          this.modelUpdated.emit(this.pieContentModel);
        }
      }
    });

    this.el.addEventListener(InsertImageEvent.TYPE, this.handleInsertImage);
    this.el.addEventListener(DeleteImageEvent.TYPE, this.handleDeleteImage);

    this.el.addEventListener(InsertSoundEvent.TYPE, this.handleInsertSound);
    this.el.addEventListener(DeleteSoundEvent.TYPE, this.handleDeleteSound);
  }

  async componentDidLoad() {
    await this.afterRender();
  }

  async componentDidUpdate() {
    await this.afterRender();

    if (this.fileInput) {
      this.fileInput.addEventListener("change", this.handleFileInputChange);
    }
  }

  async loadPieElements() {
    if (this.config && !this.disableBundler) {
      let endpoints = DEFAULT_ENDPOINTS.prod;
      if (
        this.bundleHost &&
        ["dev", "stage", "prod"].includes(this.bundleHost)
      ) {
        endpoints = DEFAULT_ENDPOINTS[this.bundleHost];
      }

      // if bundleEndpoints are provided, use them instead of the default
      // used for proxies, etc.
      let forceBundleUrl = false;
      if (this.bundleEndpoints) {
        endpoints = this.bundleEndpoints;
        forceBundleUrl = true;
      }

      await this.pieLoader.loadCloudPies({
        content: this.pieContentModel,
        doc: this.doc,
        endpoints,
        useCdn: false,
        forceBundleUrl,
        reFetchBundle: this.reFetchBundle
      });
    }
  }

  private renderMath() {
    setTimeout(() => {
      _dll_pie_lib__pie_toolbox_math_rendering_accessible.renderMath(this.el);
    }, 50);
  }

  async afterRender() {
    if (
      this.pieContentModel &&
      this.pieContentModel.markup &&
      !this.elementsLoaded
    ) {
      const elements = Object.keys(this.pieContentModel.elements).map(el => ({
        name: el,
        tag: `${el}-config`
      }));
      const loadedInfo = await this.pieLoader.elementsHaveLoaded(elements);

      if (
        loadedInfo.val &&
        !!loadedInfo.elements.find(el => this.pieContentModel.elements[el.name])
      ) {
        this.elementsLoaded = true;

        this.renderMath();
      }
    }
  }


  /**
   * Utility method to add a `@pie-element/rubric` section to an item config when creating an item should be used before setting the config.
   *
   * @deprecated this method is for temporary use, will be removed at next major release
   *
   * @param config the item config to mutate
   * @param rubricModel
   */
  @Method()
  async addRubricToConfig(config: ItemConfig, rubricModel?) {
    console.warn('If you are using complex-rubric, stop using this function to prevent having duplicated rubrics.');

    if (!rubricModel) {
      rubricModel = {
        id: "rubric",
        element: "pie-rubric",
        points: ["", "", "", ""],
        maxPoints: 4,
        excludeZero: false
      };
    }

    const configPieContent = pieContentFromConfig(config);

    addPackageToContent(
      configPieContent,
      "@pie-element/rubric",
      rubricModel as PieModel
    );

    return addRubric(configPieContent);
  }

  /**
   * Utility method to add a `@pie-element/multi-trait-rubric` section to an item config when creating an item should be used before setting the config.
   **
   * @param config the item config to mutate
   * @param multiTraitRubricModel
   */
  @Method()
  async addMultiTraitRubricToConfig(config: ItemConfig, multiTraitRubricModel?) {
    console.warn('If you are using complex-rubric, stop using this function to prevent having duplicated rubrics.');

    if (!multiTraitRubricModel) {
      multiTraitRubricModel = {
        id: "multi-trait-rubric",
        element: "pie-multi-trait-rubric",
        visibleToStudent: true,
        halfScoring: false,
        excludeZero: true,
        pointLabels: true,
        description: false,
        standards: false,
        scales: [
          {
            maxPoints: 4,
            scorePointsLabels: ['', '', '', ''],
            traitLabel: 'Trait',
            traits: [
              {
                name: '',
                standards: [],
                description: '',
                scorePointsDescriptors: [
                  '',
                  '',
                  '',
                  '',
                  '',
                ],
              },]
          }]
      }
    }

    const configPieContent = pieContentFromConfig(config);

    addPackageToContent(
      configPieContent,
      "@pie-element/multi-trait-rubric",
      multiTraitRubricModel as PieModel
    );

    return addMultiTraitRubric(configPieContent);
  }

  render() {
    if (this.pieContentModel && this.pieContentModel.markup) {
      const markup = this.getRenderMarkup();
      if (this.addPreview) {
        return (
          <pie-preview-layout config={this.config}>
            <div slot="configure">
              <pie-spinner active={!this.elementsLoaded}>
                <div class='author-container' innerHTML={markup}/>
              </pie-spinner>
            </div>
            <input type="file" hidden ref={r => (this.fileInput = r)} style={{display: 'none'}}/>
          </pie-preview-layout>
        );
      } else {
        return (
          <pie-spinner active={!this.elementsLoaded}>
            <div class='author-container' innerHTML={markup}/>
            <input type="file" hidden ref={r => (this.fileInput = r)} style={{display: 'none'}}/>
          </pie-spinner>
        );
      }
    } else {
      return <pie-spinner/>;
    }
  }
}

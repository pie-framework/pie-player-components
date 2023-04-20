/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import { HTMLStencilElement, JSXBase } from '@stencil/core/internal';
import {
  BundleEndpoints,
} from './pie-loader';
import {
  ItemConfig,
  ItemSession,
  PieContent,
  PieController,
  PieElement,
  PieModel,
} from './interface';
import {
  ExternalImageSupport,
} from './components/pie-author/dataurl-image-support';
import {
  ExternalUploadSoundSupport,
} from './components/pie-author/dataurl-upload-sound-support';

export namespace Components {
  interface PieAuthor {
    /**
    * Utility method to add a `@pie-element/multi-trait-rubric` section to an item config when creating an item should be used before setting the config. *
    * @param config the item config to mutate
    * @param multiTraitRubricModel
    */
    'addMultiTraitRubricToConfig': (config: ItemConfig, multiTraitRubricModel?: any) => Promise<PieContent>;
    /**
    * Adds a preview view which will render the content in another tab as it may appear to a student or instructor.
    */
    'addPreview': boolean;
    /**
    * If set the player will add a rubric authoring interaction to the config
    */
    'addRubric': boolean;
    /**
    * Utility method to add a `@pie-element/rubric` section to an item config when creating an item should be used before setting the config.
    * @deprecated this method is for temporary use, will be removed at next major release
    * @param config the item config to mutate
    * @param rubricModel
    */
    'addRubricToConfig': (config: ItemConfig, rubricModel?: any) => Promise<PieContent>;
    /**
    * Provide this property override the default endpoints used by the player to retrieve JS bundles. Must be set before setting the config property. Most users will not need to use this property.
    */
    'bundleEndpoints'?: BundleEndpoints;
    /**
    * Optionally specifies the back-end that builds and hosts javascript bundles for rendering assessment items. This property lets you choose which environment to use, from 'dev' , 'stage' or 'prod' environments. Until 1.0 will default to 'stage'.
    */
    'bundleHost'?: string;
    /**
    * used in our demo environment to allow author to watch config settings and make updates defaults to false (do not set it to true because it was not tested properly)
    * @type {boolean}
    * @private
    */
    'canWatchConfigSettings': boolean;
    /**
    * The Pie config model.
    */
    'config': ItemConfig;
    /**
    * To customize the standard behaviour provided by interaction configuration views you can provide settings key-ed by the package name.  e.g.  `{ '@pie-element/inline-choice': { promptLabel: 'Item Stem' } }`  The settings that are configurable for each authoring view are documented in the `@package-name/docs` folder for each package.
    */
    'configSettings'?: { [packageName: string]: Object };
    /**
    * To provide a way to add a default model to complex-rubric
    */
    'defaultComplexRubricModel'?: Object;
    /**
    * Allows disabling of the default behaviour which is to look up and load the JS bundle that define the Custom Elements used by the item config. This if for advanced use cases when using the pie-player in a container that is managing loading of Custom Elements and Controllers.
    */
    'disableBundler': boolean;
    /**
    * external providers can set this if they need to upload the assets to the cloud etc. by default we use data urls
    */
    'imageSupport': ExternalImageSupport;
    /**
    * If pie-author is used inside pie-api-author component. Do not set it manually.
    */
    'isInsidePieApiAuthor'?: boolean;
    /**
    * external providers can set this if they need to upload the assets to the cloud etc. by default we use data urls
    */
    'uploadSoundSupport': ExternalUploadSoundSupport;
    'validateModels': () => Promise<any>;
    'version': string;
  }
  interface PieEmbed {}
  interface PiePlayer {
    /**
    * Simulates a correct response for the item. This property will only have this effect if the `hosted` property is false and player is running client-side-only.
    */
    'addCorrectResponse': boolean;
    /**
    * Provide this property override the default endpoints used by the player to retrieve JS bundles. Must be set before setting the config property. Most users will not need to use this property.
    */
    'bundleEndpoints'?: BundleEndpoints;
    /**
    * Optionally specifies the back-end that builds and hosts javascript bundles for rendering assessment items. This property lets you choose which environment to use, from 'dev' , 'stage' or 'prod' environments. Until 1.0 will default to 'stage'.
    */
    'bundleHost'?: string;
    /**
    * The Pie config model.
    */
    'config': ItemConfig;
    /**
    * Allows disabling of the default behaviour which is to look up and load the JS bundle that define the Custom Elements used by the item config. This if for advanced use cases when using the pie-player in a container that is managing loading of Custom Elements and Controllers.
    */
    'disableBundler': boolean;
    /**
    * Describes runtime environment for the player.
    */
    'env': Object;
    /**
    * Indicates if player running in the context of a PIE hosting system. Do not modify the default value for this property if you are not implementing a PIE host. If true, the host is responsible for all model updates.
    */
    'hosted'?: boolean;
    'provideScore': () => Promise<false | any[]>;
    /**
    * If the item contains a stimulus, the player will render it by default. Set this property to false to not render stimulus.
    */
    'renderStimulus': boolean;
    /**
    * The Pie Session
    */
    'session': ItemSession;
    /**
    * For previewing changes to an item. Updates the model for one question in the item model.
    * @param update the updated model
    */
    'updateElementModel': (update: PieModel) => Promise<void>;
    'version': string;
  }
  interface PiePreviewControl {}
  interface PiePreviewLayout {
    'config': Object;
  }
  interface PieSpinner {
    /**
    * Shows the spinner
    */
    'active': boolean;
  }
  interface PieStimulusLayout {}
}

declare global {


  interface HTMLPieAuthorElement extends Components.PieAuthor, HTMLStencilElement {}
  var HTMLPieAuthorElement: {
    prototype: HTMLPieAuthorElement;
    new (): HTMLPieAuthorElement;
  };

  interface HTMLPieEmbedElement extends Components.PieEmbed, HTMLStencilElement {}
  var HTMLPieEmbedElement: {
    prototype: HTMLPieEmbedElement;
    new (): HTMLPieEmbedElement;
  };

  interface HTMLPiePlayerElement extends Components.PiePlayer, HTMLStencilElement {}
  var HTMLPiePlayerElement: {
    prototype: HTMLPiePlayerElement;
    new (): HTMLPiePlayerElement;
  };

  interface HTMLPiePreviewControlElement extends Components.PiePreviewControl, HTMLStencilElement {}
  var HTMLPiePreviewControlElement: {
    prototype: HTMLPiePreviewControlElement;
    new (): HTMLPiePreviewControlElement;
  };

  interface HTMLPiePreviewLayoutElement extends Components.PiePreviewLayout, HTMLStencilElement {}
  var HTMLPiePreviewLayoutElement: {
    prototype: HTMLPiePreviewLayoutElement;
    new (): HTMLPiePreviewLayoutElement;
  };

  interface HTMLPieSpinnerElement extends Components.PieSpinner, HTMLStencilElement {}
  var HTMLPieSpinnerElement: {
    prototype: HTMLPieSpinnerElement;
    new (): HTMLPieSpinnerElement;
  };

  interface HTMLPieStimulusLayoutElement extends Components.PieStimulusLayout, HTMLStencilElement {}
  var HTMLPieStimulusLayoutElement: {
    prototype: HTMLPieStimulusLayoutElement;
    new (): HTMLPieStimulusLayoutElement;
  };
  interface HTMLElementTagNameMap {
    'pie-author': HTMLPieAuthorElement;
    'pie-embed': HTMLPieEmbedElement;
    'pie-player': HTMLPiePlayerElement;
    'pie-preview-control': HTMLPiePreviewControlElement;
    'pie-preview-layout': HTMLPiePreviewLayoutElement;
    'pie-spinner': HTMLPieSpinnerElement;
    'pie-stimulus-layout': HTMLPieStimulusLayoutElement;
  }
}

declare namespace LocalJSX {
  interface PieAuthor {
    /**
    * Adds a preview view which will render the content in another tab as it may appear to a student or instructor.
    */
    'addPreview'?: boolean;
    /**
    * If set the player will add a rubric authoring interaction to the config
    */
    'addRubric'?: boolean;
    /**
    * Provide this property override the default endpoints used by the player to retrieve JS bundles. Must be set before setting the config property. Most users will not need to use this property.
    */
    'bundleEndpoints'?: BundleEndpoints;
    /**
    * Optionally specifies the back-end that builds and hosts javascript bundles for rendering assessment items. This property lets you choose which environment to use, from 'dev' , 'stage' or 'prod' environments. Until 1.0 will default to 'stage'.
    */
    'bundleHost'?: string;
    /**
    * used in our demo environment to allow author to watch config settings and make updates defaults to false (do not set it to true because it was not tested properly)
    * @type {boolean}
    * @private
    */
    'canWatchConfigSettings'?: boolean;
    /**
    * The Pie config model.
    */
    'config'?: ItemConfig;
    /**
    * To customize the standard behaviour provided by interaction configuration views you can provide settings key-ed by the package name.  e.g.  `{ '@pie-element/inline-choice': { promptLabel: 'Item Stem' } }`  The settings that are configurable for each authoring view are documented in the `@package-name/docs` folder for each package.
    */
    'configSettings'?: { [packageName: string]: Object };
    /**
    * To provide a way to add a default model to complex-rubric
    */
    'defaultComplexRubricModel'?: Object;
    /**
    * Allows disabling of the default behaviour which is to look up and load the JS bundle that define the Custom Elements used by the item config. This if for advanced use cases when using the pie-player in a container that is managing loading of Custom Elements and Controllers.
    */
    'disableBundler'?: boolean;
    /**
    * external providers can set this if they need to upload the assets to the cloud etc. by default we use data urls
    */
    'imageSupport'?: ExternalImageSupport;
    /**
    * If pie-author is used inside pie-api-author component. Do not set it manually.
    */
    'isInsidePieApiAuthor'?: boolean;
    /**
    * Emmitted when the content models in the config have been set on the content
    */
    'onModelLoaded'?: (event: CustomEvent<any>) => void;
    /**
    * Emmitted when the model for the content has been updated within the ui due to user action.
    */
    'onModelUpdated'?: (event: CustomEvent<any>) => void;
    /**
    * external providers can set this if they need to upload the assets to the cloud etc. by default we use data urls
    */
    'uploadSoundSupport'?: ExternalUploadSoundSupport;
    'version'?: string;
  }
  interface PieEmbed {}
  interface PiePlayer {
    /**
    * Simulates a correct response for the item. This property will only have this effect if the `hosted` property is false and player is running client-side-only.
    */
    'addCorrectResponse'?: boolean;
    /**
    * Provide this property override the default endpoints used by the player to retrieve JS bundles. Must be set before setting the config property. Most users will not need to use this property.
    */
    'bundleEndpoints'?: BundleEndpoints;
    /**
    * Optionally specifies the back-end that builds and hosts javascript bundles for rendering assessment items. This property lets you choose which environment to use, from 'dev' , 'stage' or 'prod' environments. Until 1.0 will default to 'stage'.
    */
    'bundleHost'?: string;
    /**
    * The Pie config model.
    */
    'config'?: ItemConfig;
    /**
    * Allows disabling of the default behaviour which is to look up and load the JS bundle that define the Custom Elements used by the item config. This if for advanced use cases when using the pie-player in a container that is managing loading of Custom Elements and Controllers.
    */
    'disableBundler'?: boolean;
    /**
    * Describes runtime environment for the player.
    */
    'env'?: Object;
    /**
    * Indicates if player running in the context of a PIE hosting system. Do not modify the default value for this property if you are not implementing a PIE host. If true, the host is responsible for all model updates.
    */
    'hosted'?: boolean;
    /**
    * Emitted when the content in the config has been loaded.
    */
    'onLoad-complete'?: (event: CustomEvent<any>) => void;
    /**
    * Emmitted if there is an error encountered while rendering. `event.detail` will be a string containing a message about the error.
    */
    'onPlayer-error'?: (event: CustomEvent<any>) => void;
    /**
    * TODO - Emmitted when any all interactions in a PIE Assessment Item have reported that a user has provided a response to the interaction.
    */
    'onResponseCompleted'?: (event: CustomEvent<any>) => void;
    /**
    * Emmitted when any interaction in the set of interactions being rendered has been mutated by user action.  The `Event.detail` property contains a `complete` property. If true, this indicates that enough data has been gathered by the interaciton to constitute a response. For example, in a plot line questsion where a user had to plot three points to plot the line, the `complete` propery would be false if 1 or 2 points had been added, but true if all three had.
    */
    'onSession-changed'?: (event: CustomEvent<any>) => void;
    /**
    * If the item contains a stimulus, the player will render it by default. Set this property to false to not render stimulus.
    */
    'renderStimulus'?: boolean;
    /**
    * The Pie Session
    */
    'session'?: ItemSession;
    'version'?: string;
  }
  interface PiePreviewControl {
    'onEnvChanged'?: (event: CustomEvent<any>) => void;
  }
  interface PiePreviewLayout {
    'config'?: Object;
  }
  interface PieSpinner {
    /**
    * Shows the spinner
    */
    'active'?: boolean;
  }
  interface PieStimulusLayout {}

  interface IntrinsicElements {
    'pie-author': PieAuthor;
    'pie-embed': PieEmbed;
    'pie-player': PiePlayer;
    'pie-preview-control': PiePreviewControl;
    'pie-preview-layout': PiePreviewLayout;
    'pie-spinner': PieSpinner;
    'pie-stimulus-layout': PieStimulusLayout;
  }
}

export { LocalJSX as JSX };


declare module "@stencil/core" {
  export namespace JSX {
    interface IntrinsicElements {
      'pie-author': LocalJSX.PieAuthor & JSXBase.HTMLAttributes<HTMLPieAuthorElement>;
      'pie-embed': LocalJSX.PieEmbed & JSXBase.HTMLAttributes<HTMLPieEmbedElement>;
      'pie-player': LocalJSX.PiePlayer & JSXBase.HTMLAttributes<HTMLPiePlayerElement>;
      'pie-preview-control': LocalJSX.PiePreviewControl & JSXBase.HTMLAttributes<HTMLPiePreviewControlElement>;
      'pie-preview-layout': LocalJSX.PiePreviewLayout & JSXBase.HTMLAttributes<HTMLPiePreviewLayoutElement>;
      'pie-spinner': LocalJSX.PieSpinner & JSXBase.HTMLAttributes<HTMLPieSpinnerElement>;
      'pie-stimulus-layout': LocalJSX.PieStimulusLayout & JSXBase.HTMLAttributes<HTMLPieStimulusLayoutElement>;
    }
  }
}



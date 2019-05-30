/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import { HTMLStencilElement, JSXBase } from '@stencil/core/internal';
import {
  ItemConfig,
  ItemSession,
  PieItemElement,
  PieModel,
} from './interface';


export namespace Components {
  interface PieAuthor {
    'addPreview': boolean;
    /**
    * The Pie config model.
    */
    'config': ItemConfig;
    /**
    * To customize the standard behaviour provided by interaction configuration views you can  provide settings key-ed by the package name.  e.g.  `{ '@pie-element/inline-choice': { promptLabel: 'Item Stem' } }`  The settings that are configurable for each authoring view are documented in  the `@package-name/docs` folder for each package.
    */
    'configSettings'?: {[packageName:string]:Object};
  }
  interface PieLoader {
    /**
    * Loads the custom elments defined by the PIEs, if they are not already loaded.
    */
    'loadPies': (pieHash: PieItemElement) => Promise<void>;
    /**
    * If the bundle is not available yet, the maximum number of milliseconds  between two retries for downloading
    */
    'maxTimeout': number;
    /**
    * If the bundle is not available yet, number of milliseconds before starting  the first retry attempt.
    */
    'minTimeout': number;
    /**
    * If the bundle is not available yet, the number of re-try attempts to download.
    */
    'retries': number;
  }
  interface PiePlayer {
    /**
    * The Pie config model.
    */
    'config': ItemConfig;
    /**
    * Describes runtime environment for the player.
    */
    'env': Object;
    /**
    * Indicates if player running in the context of a PIE hosting system. Do not modify the default value for this property if you are not implementing a PIE host. If true, the host is responsible for all model updates.
    */
    'hosted'?: boolean;
    /**
    * If provided this url is used for loading the JS bundle for rendering the PIE Elements. If not provided the system will default to using the PIE Cloud service to locate and load JS bundles.
    */
    'jsBundleUrls'?: string[];
    /**
    * The Pie Session
    */
    'session': ItemSession;
    /**
    * For previewing changes to an item. Updates the model for one question in the item model.
    */
    'updateElementModel': (update: PieModel) => Promise<void>;
  }
  interface PiePreviewControl {}
  interface PiePreviewLayout {
    'config': Object;
  }
  interface PieRubricAuthor {
    'rubricModel': Object;
  }
  interface PieSpinner {}
  interface PieStimulusLayout {}
}

declare namespace LocalJSX {
  interface PieAuthor extends JSXBase.HTMLAttributes {
    'addPreview'?: boolean;
    /**
    * The Pie config model.
    */
    'config'?: ItemConfig;
    /**
    * To customize the standard behaviour provided by interaction configuration views you can  provide settings key-ed by the package name.  e.g.  `{ '@pie-element/inline-choice': { promptLabel: 'Item Stem' } }`  The settings that are configurable for each authoring view are documented in  the `@package-name/docs` folder for each package.
    */
    'configSettings'?: {[packageName:string]:Object};
    /**
    * Emmitted when the model for the content has been updated in the ui.
    */
    'onModelUpdated'?: (event: CustomEvent<any>) => void;
  }
  interface PieLoader extends JSXBase.HTMLAttributes {
    /**
    * If the bundle is not available yet, the maximum number of milliseconds  between two retries for downloading
    */
    'maxTimeout'?: number;
    /**
    * If the bundle is not available yet, number of milliseconds before starting  the first retry attempt.
    */
    'minTimeout'?: number;
    /**
    * If the bundle is not available yet, the number of re-try attempts to download.
    */
    'retries'?: number;
  }
  interface PiePlayer extends JSXBase.HTMLAttributes {
    /**
    * The Pie config model.
    */
    'config'?: ItemConfig;
    /**
    * Describes runtime environment for the player.
    */
    'env'?: Object;
    /**
    * Indicates if player running in the context of a PIE hosting system. Do not modify the default value for this property if you are not implementing a PIE host. If true, the host is responsible for all model updates.
    */
    'hosted'?: boolean;
    /**
    * If provided this url is used for loading the JS bundle for rendering the PIE Elements. If not provided the system will default to using the PIE Cloud service to locate and load JS bundles.
    */
    'jsBundleUrls'?: string[];
    /**
    * Emmitted if there is an error encountered while rendering. `event.detail` will be a string containing a message about the error.
    */
    'onPlayer-error'?: (event: CustomEvent<any>) => void;
    /**
    * TODO - Emmitted when any all interactions in a PIE Assessment Item have reported that a user  has provided a response to the interaction.
    */
    'onResponseCompleted'?: (event: CustomEvent<any>) => void;
    /**
    * Emmitted when any interaction in the set of interactions being rendered has been mutated by user action.
    */
    'onSession-changed'?: (event: CustomEvent<any>) => void;
    /**
    * The Pie Session
    */
    'session'?: ItemSession;
  }
  interface PiePreviewControl extends JSXBase.HTMLAttributes {
    'onEnvChanged'?: (event: CustomEvent<any>) => void;
  }
  interface PiePreviewLayout extends JSXBase.HTMLAttributes {
    'config'?: Object;
  }
  interface PieRubricAuthor extends JSXBase.HTMLAttributes {
    'rubricModel'?: Object;
  }
  interface PieSpinner extends JSXBase.HTMLAttributes {}
  interface PieStimulusLayout extends JSXBase.HTMLAttributes {}

  interface IntrinsicElements {
    'pie-author': PieAuthor;
    'pie-loader': PieLoader;
    'pie-player': PiePlayer;
    'pie-preview-control': PiePreviewControl;
    'pie-preview-layout': PiePreviewLayout;
    'pie-rubric-author': PieRubricAuthor;
    'pie-spinner': PieSpinner;
    'pie-stimulus-layout': PieStimulusLayout;
  }
}

export { LocalJSX as JSX };


declare module "@stencil/core" {
  export namespace JSX {
    interface IntrinsicElements extends LocalJSX.IntrinsicElements {}
  }
}


declare global {



  interface HTMLPieAuthorElement extends Components.PieAuthor, HTMLStencilElement {}
  var HTMLPieAuthorElement: {
    prototype: HTMLPieAuthorElement;
    new (): HTMLPieAuthorElement;
  };

  interface HTMLPieLoaderElement extends Components.PieLoader, HTMLStencilElement {}
  var HTMLPieLoaderElement: {
    prototype: HTMLPieLoaderElement;
    new (): HTMLPieLoaderElement;
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

  interface HTMLPieRubricAuthorElement extends Components.PieRubricAuthor, HTMLStencilElement {}
  var HTMLPieRubricAuthorElement: {
    prototype: HTMLPieRubricAuthorElement;
    new (): HTMLPieRubricAuthorElement;
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
    'pie-loader': HTMLPieLoaderElement;
    'pie-player': HTMLPiePlayerElement;
    'pie-preview-control': HTMLPiePreviewControlElement;
    'pie-preview-layout': HTMLPiePreviewLayoutElement;
    'pie-rubric-author': HTMLPieRubricAuthorElement;
    'pie-spinner': HTMLPieSpinnerElement;
    'pie-stimulus-layout': HTMLPieStimulusLayoutElement;
  }

  interface ElementTagNameMap extends HTMLElementTagNameMap {}
}


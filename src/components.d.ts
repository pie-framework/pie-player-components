/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import '@stencil/core';


import {
  ItemConfig,
  ItemSession,
  PieItemElement,
} from './interface';


export namespace Components {

  interface PieAuthor {
    /**
    * The Pie config model.
    */
    'config': ItemConfig;
    /**
    * Describes runtime environment for the player.
    */
    'env': Object;
    /**
    * The Pie Session
    */
    'session': Object;
  }
  interface PieAuthorAttributes extends StencilHTMLAttributes {
    /**
    * The Pie config model.
    */
    'config'?: ItemConfig;
    /**
    * Describes runtime environment for the player.
    */
    'env'?: Object;
    /**
    * The Pie Session
    */
    'session'?: Object;
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
  interface PieLoaderAttributes extends StencilHTMLAttributes {
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
    * The Pie Session
    */
    'session': ItemSession;
  }
  interface PiePlayerAttributes extends StencilHTMLAttributes {
    /**
    * The Pie config model.
    */
    'config'?: ItemConfig;
    /**
    * Describes runtime environment for the player.
    */
    'env'?: Object;
    /**
    * TODO - Emmitted when any all interactions in a PIE Assessment Item have reported that a user  has provided a response to the interaction.
    */
    'onResponseCompleted'?: (event: CustomEvent) => void;
    /**
    * Emmitted when any interaction in the set of interactions being rendered has been mutated by user action.
    */
    'onSessionChanged'?: (event: CustomEvent) => void;
    /**
    * The Pie Session
    */
    'session'?: ItemSession;
  }
}

declare global {
  interface StencilElementInterfaces {
    'PieAuthor': Components.PieAuthor;
    'PieLoader': Components.PieLoader;
    'PiePlayer': Components.PiePlayer;
  }

  interface StencilIntrinsicElements {
    'pie-author': Components.PieAuthorAttributes;
    'pie-loader': Components.PieLoaderAttributes;
    'pie-player': Components.PiePlayerAttributes;
  }


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

  interface HTMLElementTagNameMap {
    'pie-author': HTMLPieAuthorElement
    'pie-loader': HTMLPieLoaderElement
    'pie-player': HTMLPiePlayerElement
  }

  interface ElementTagNameMap {
    'pie-author': HTMLPieAuthorElement;
    'pie-loader': HTMLPieLoaderElement;
    'pie-player': HTMLPiePlayerElement;
  }


  export namespace JSX {
    export interface Element {}
    export interface IntrinsicElements extends StencilIntrinsicElements {
      [tagName: string]: any;
    }
  }
  export interface HTMLAttributes extends StencilHTMLAttributes {}

}

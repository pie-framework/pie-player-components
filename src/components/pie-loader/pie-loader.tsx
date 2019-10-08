import {
  Component,
  Method,
  Prop
} from '@stencil/core';
import { PieItemElement} from '../../interface';
import { PieLoader } from '../../pie-loader';

/**
 * This component wraps the utility for loading bundles PIE pacakges from 
 * the build service. It is not required to load this component if using `pie-player` 
 * or `pie-author` components.
 */
@Component({
  tag: 'pie-loader',
  shadow: false
})
export class Loader {

  loader = new PieLoader();

  @Prop({ context: 'document' }) doc!: Document;


  /**
   * If the bundle is not available yet, the number of re-try attempts
   * to download.
   */
  @Prop() retries: number = 10;

  /**
   * If the bundle is not available yet, number of milliseconds before starting 
   * the first retry attempt.
   */
  @Prop() minTimeout: number = 1000;

   /**
   * If the bundle is not available yet, the maximum number of milliseconds 
   * between two retries for downloading
   */
  @Prop() maxTimeout: number = 2000;

  /**
   * Loads the custom elments defined by the PIEs, if they are not already loaded.
   * @param {Object<string,string>} pieHash - The PIE elements to load. `key` = html element, `value`: npm package
   */
  @Method()
  async loadPies(pieHash: PieItemElement) {
    return await this.loader.loadCloudPies(pieHash, this.doc, null, {
      retries: this.retries,
      minTimeout: this.minTimeout,
      maxTimeout: this.maxTimeout
    })
  }

}

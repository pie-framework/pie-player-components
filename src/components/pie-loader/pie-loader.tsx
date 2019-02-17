import {
  Component,
  Method,
  Prop
} from '@stencil/core';
import { PieItemElement} from '../../interface';
import { PieLoader } from '../../pie-loader';


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
    return await this.loader.loadCloudPies(pieHash, this.doc, {
      retries: this.retries,
      minTimeout: this.minTimeout,
      maxTimeout: this.maxTimeout
    })
  }

}

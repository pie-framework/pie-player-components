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
   * Loads the custom elments defined by the PIEs, if they are not already loaded.
   * @param {Object<string,string>} pieHash - The PIE elements to load. `key` = html element, `value`: npm package
   */
  @Method()
  loadPies(pieHash: PieItemElement) {
    return this.loader.loadCloudPies(pieHash, this.doc)
  }

}

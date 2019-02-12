import { Component, Prop } from '@stencil/core';
import { PieContent } from '../../interface';

/**
 * Pie Author will load a Pie Content model for authoring.
 * It needs to be run in the context 
 */
@Component({
  tag: 'pie-author',
  styleUrl: 'pie-author.css',
  shadow: true
})
export class Author {
  /**
   * The item config
   */
  @Prop() config: PieContent;


  componentWillLoad(){
    // get item model
    // find out if elements are registered yet for the config pies
  }

  render() {
    return <div>Hello, World! </div>;
  }
}

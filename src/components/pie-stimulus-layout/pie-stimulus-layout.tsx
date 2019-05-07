import { Component } from '@stencil/core';

@Component({ tag: 'pie-stimulus-layout' , styleUrl: 'pie-stimulus-layout.css'})
export class PieStimulusLayout {
  render() {
    return (
      <div id="pie-stimulus-container">
        <div id="stimulus"><slot name='stimulus' /></div>
        <div id="item"><slot name='item' /></div>
      </div>
      )
    }
}

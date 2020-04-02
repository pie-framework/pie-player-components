import { Component, h } from '@stencil/core';

@Component({ tag: 'pie-stimulus-layout' , styleUrl: 'pie-stimulus-layout.css'})
export class PieStimulusLayout {
  static handleElements() {
    const el = document.querySelector('#pie-stimulus-container') as HTMLElement;

    if (el) {
      const boundRect = el.getBoundingClientRect();

      el.style.height = `calc(100vh - ${boundRect.top}px`;
    }
  }

  componentDidRender() {
    PieStimulusLayout.handleElements();
  }

  componentDidLoad() {
    PieStimulusLayout.handleElements();
  }

  componentDidUpdate() {
    PieStimulusLayout.handleElements();
  }

  render() {
    return (
      <div id="pie-stimulus-container">
        <div id="stimulus"><slot name='stimulus' /></div>
        <div id="item"><slot name='item' /></div>
      </div>
      )
    }
}

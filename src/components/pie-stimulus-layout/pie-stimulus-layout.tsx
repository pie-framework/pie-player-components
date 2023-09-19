import {Component, h, State} from '@stencil/core';

@Component({ tag: 'pie-stimulus-layout' , styleUrl: 'pie-stimulus-layout.css'})
export class PieStimulusLayout {
  static handleElements() {
    const el = document.querySelector('#pie-stimulus-container') as HTMLElement;

    if (el) {
      const boundRect = el.getBoundingClientRect();

      el.style.height = `calc(100vh - ${boundRect.top}px`;
    }
  }
  private resizer: HTMLDivElement;

  @State() isResizing = false;
  @State() initialX = 0;
  @State() initialLeftFlex = 0.5;
  @State() initialRightFlex = 0.5;
  componentDidRender() {
    PieStimulusLayout.handleElements();
  }

  componentDidLoad() {
    PieStimulusLayout.handleElements();
    this.resizer.addEventListener('mousedown', (e) => {
      this.isResizing = true;
      this.initialX = e.clientX;
    });
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    window.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  componentDidUpdate() {
    PieStimulusLayout.handleElements();
  }

  componentDidUnload() {
    window.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    window.removeEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  private handleMouseMove(e: MouseEvent) {
    if (this.isResizing) {
      const deltaX = e.clientX - this.initialX;
      const containerWidth = this.resizer.parentElement.clientWidth;

      const newLeftFlex = (containerWidth * this.initialLeftFlex + deltaX) / containerWidth;
      const newRightFlex = 1 - newLeftFlex;
      if (newLeftFlex >= 0 && newRightFlex >= 0 && newLeftFlex <= 1 && newRightFlex <= 1) {
        this.initialLeftFlex = newLeftFlex;
        this.initialRightFlex = newRightFlex;

        // Update the initial cursor position
        this.initialX = e.clientX;

        // this.resizer.style.width = '5px'; // Adjust the width as needed
        // this.resizer.style.backgroundColor = 'black'; // Adjust the background color as needed
      }
    }
  }

  private handleMouseUp() {
    this.isResizing = false;
    // this.resizer.style.width = '0px'; // Adjust the width as needed
    // this.resizer.style.backgroundColor = 'transparent'; // Adjust the background color as needed
  }




  render() {
    return (
      <div id="pie-stimulus-container">
        <div id="stimulus"
             style={{ flex: `${this.initialLeftFlex}`,
               transition: this.isResizing ? 'none' : 'flex 0.2s ease'}}>
          <slot name='stimulus' />
        </div>
        <div id="resizer" ref={(el) => (this.resizer = el as HTMLDivElement)}></div>
        <div id="item"
             style={{ flex: `${this.initialRightFlex}`,
                      transition: this.isResizing ? 'none' : 'flex 0.2s ease'
        }}>
          <slot name='item' />
        </div>
      </div>
      )
    }
}

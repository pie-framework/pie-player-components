import {Component, h, Prop, State} from '@stencil/core';

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

  // shows us if resizing is activated or not
  @Prop() allowedResize: boolean = false;

  @State() isResizing = false;
  @State() initialX = 0;
  @State() initialLeftFlex = 0.5;
  @State() initialRightFlex = 0.5;

  componentDidRender() {
    PieStimulusLayout.handleElements();
  }

  componentDidLoad() {
    PieStimulusLayout.handleElements();
    if(this.allowedResize){
      this.resizer.addEventListener('mousedown', (e) => {
        this.isResizing = true;
        this.initialX = e.clientX;
      });
      window.addEventListener('mousemove', this.handleMouseMove.bind(this));
      window.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }
  }

  componentDidUpdate() {
    PieStimulusLayout.handleElements();
  }

  componentDidUnload() {
    if(this.allowedResize){
      window.removeEventListener('mousemove', this.handleMouseMove.bind(this));
      window.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    }
  }

  private handleMouseMove(e: MouseEvent) {
    if (this.isResizing && this.allowedResize) {
      const deltaX = e.clientX - this.initialX;
      const containerWidth = this.resizer.parentElement.clientWidth;

      const newLeftFlex = (containerWidth * this.initialLeftFlex + deltaX) / containerWidth;
      const newRightFlex = 1 - newLeftFlex;
      if (newLeftFlex >= 0 && newRightFlex >= 0 && newLeftFlex <= 1 && newRightFlex <= 1) {
        this.initialLeftFlex = newLeftFlex;
        this.initialRightFlex = newRightFlex;

        // Update the initial cursor position
        this.initialX = e.clientX;
      }
    }
  }

  private handleMouseUp() {
    this.isResizing = false;
  }


  render() {
    return (
      <div id="pie-stimulus-container">
        <div id="stimulus"
             style={{ flex: `${this.initialLeftFlex}`,
               transition: this.isResizing ? 'none' : 'flex 0.2s ease'}}>
          <slot name='stimulus' />
        </div>
        { this.allowedResize &&
          <div id="resizer" ref={(el) => (this.resizer = el as HTMLDivElement)} />
        }
        <div id="item"
             style={{ flex: `${this.initialRightFlex}`,
               transition: this.isResizing ? 'none' : 'flex 0.2s ease'}}>
          <slot name='item' />
        </div>
      </div>
      )
    }
}

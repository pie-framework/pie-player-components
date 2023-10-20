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

  private readMoreButton: HTMLButtonElement;

  private stimulus: HTMLDivElement;

  // shows if resizing is activated or not
  @Prop() allowedResize?: boolean = false;

  // shows if user is currently resizing the component,
  @State() isResizing = false;
  // the initial X-coordinate of the mouse cursor.
  @State() initialX = 0;
  //  flex values of the left component
  @State() initialLeftFlex = 0.5;
  //  flex values of the right component as the user resizes them
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
      this.resizer.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    this.readMoreButton.addEventListener("click", () => {
      if (this.readMoreButton.innerHTML.includes('Read More')) {
         this.stimulus.style.maxHeight = 'none';
        this.readMoreButton.innerHTML = `Read Less <span class=arrow-up>&#9650;</span>`;
        this.stimulus.style.overflow = 'auto'
        this.stimulus.classList.remove('truncated');
      }else {
        this.readMoreButton.innerHTML = `Read More <span class=arrow-down>&#9660;</span>`;
        this.stimulus.style.maxHeight = '25%';
        this.stimulus.style.overflow = 'hidden';
        this.stimulus.scrollTop = 0;
        this.stimulus.classList.add('truncated');
      }
    });
  }

  componentDidUpdate() {
    PieStimulusLayout.handleElements();
  }

  componentDidUnload() {
    if(this.allowedResize){
      window.removeEventListener('mousemove', this.handleMouseMove.bind(this));
      this.resizer.removeEventListener('mouseup', this.handleMouseUp.bind(this));
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

  // add style when the containers are resizable
  private getStyle(flex) {
    if (this.allowedResize) {
      return { flex: `${flex}`, transition: this.isResizing ? 'none' : 'flex 0.1s ease'}
    }
    return {};
  }


  render() {
    return (
      <div id="pie-stimulus-container">
        <div id="stimulus"
             class="truncated"
             ref={(el) => this.stimulus = el as HTMLDivElement}
             style={this.getStyle(this.initialLeftFlex)}>
          <slot name='stimulus' />
        </div>
        <button id="read-more" ref={(el) => this.readMoreButton = el as HTMLButtonElement}>
          Read More
          <span class="arrow-down">&#9660;</span>
        </button>
        { this.allowedResize &&
          <div id="resizer" ref={(el) => (this.resizer = el as HTMLDivElement)} />
        }
        <div id="item"
             style={this.getStyle(this.initialRightFlex)}>
          <slot name='item' />
        </div>
      </div>
      )
    }
}

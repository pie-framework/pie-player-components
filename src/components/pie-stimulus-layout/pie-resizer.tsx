import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'pie-resizer',
})
export class AppResizer {
  @Prop() initialWidth: string;

  private resizing = false;
  private startClientX = 0;

  private handleMouseDown(event: MouseEvent) {
    this.resizing = true;
    this.startClientX = event.clientX;
  }

  private handleMouseMove(event: MouseEvent) {
    if (this.resizing) {
      const deltaX = event.clientX - this.startClientX;
      const newWidth = parseInt(this.initialWidth, 10) + deltaX;
      if (newWidth > 0) {
        this.initialWidth = `${newWidth}px`;
      }
    }
  }

  private handleMouseUp() {
    this.resizing = false;
  }

  render() {
    return (
      <div
        class="resizer"
        onMouseDown={(e: MouseEvent) => this.handleMouseDown(e)}
        onMouseMove={(e: MouseEvent) => this.handleMouseMove(e)}
        onMouseUp={() => this.handleMouseUp()}
      ></div>
    );
  }
}

import {
  Component,
  Event,
  EventEmitter,
  Prop,
  h
} from "@stencil/core";

// TODO sticky mdc focus workaround https://github.com/prateekbh/preact-material-components/issues/625

@Component({
  tag: "code-editor",
  styleUrls: ['code-editor.scss']
})
export class CodeEditor {
  @Prop() text: string;

  @Event() updated: EventEmitter<string>;

  @Event() enter : EventEmitter<void>;

  componentDidLoad() {}

  handleActivated(ev) {}

  updatePlayer(e: CustomEvent) {
    console.log("update player..");
  }
  
  textAreaChanged(e: InputEvent) {
    this.updated.emit( (e.target as any).value);
  }
  
  onKeyDown(ev: KeyboardEvent) {
    if (ev.key === "Enter" && ev.ctrlKey) {
      this.enter.emit();
    }
  }

  render() {
    return <textarea class="ta" value={this.text} 
    onKeyDown={e => this.onKeyDown(e)}
    onInput={e => this.textAreaChanged(e as InputEvent)} />;
  }
}

import { Component, State, Watch, Prop, h } from "@stencil/core";

import( "@material/mwc-button");

// TODO sticky mdc focus workaround https://github.com/prateekbh/preact-material-components/issues/625

@Component({
  tag: "item-preview-tool",
  styleUrls: ["item-preview-tool.scss"]
})
export class ItemPreviewTool {
  @State() config: any;

  @Prop() text:string = "{}";

  @State() notValid : boolean;

  componentDidLoad() {}

  handleActivated(ev) {}

  textUpdated(e: CustomEvent<string>) {
    this.text = e.detail;
  }

  applyUpdate() {

    try{
      const o = JSON.parse(this.text);
      console.log('valid json!')
      this.notValid = false;

      this.config = o;
    } catch(e ) {

      try {

        const f = new Function(`return ${this.text};`)
        const d = f();
        console.log('d:', d);
        this.config = d;
        this.notValid = false;
      } catch (e)  {
        this.notValid = true;
      }
    }
  }

  buttonClicked(e: Event) {
    console.log('clicked', e)
    this.applyUpdate();
  }

  render() {
    return (
      <div class="item-preview-tool">
        <div class="left-pane">
          {/* <div class="code-editor">... in here </div> */}
          <div class="controls">
            <mwc-button unelevated outlined="true" onClick={e => this.buttonClicked(e)} label="update"></mwc-button>
          </div>
          <code-editor text={this.text}
          class="code-editor"
          onEnter={e => this.applyUpdate()}
          onUpdated={e => this.textUpdated(e)} ></code-editor>
        </div>
        <div class="right-pane">
          {this.notValid ? <div>not valid json/js</div> : <pie-player config={this.config}></pie-player> }
        </div>
      </div>
    );
  }
}

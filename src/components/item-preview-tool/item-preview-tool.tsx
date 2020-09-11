import { Component, State, Prop, h } from "@stencil/core";

import( "@material/mwc-button");

// TODO sticky mdc focus workaround https://github.com/prateekbh/preact-material-components/issues/625


const demoItem = {
        id: '1',
        elements: {
          'pie-multiple-choice': '@pie-element/multiple-choice@5.0.7'
        },
        models: [
          {
            id: '1',
            element: 'pie-multiple-choice',
            prompt: 'What is the theme of this poem',
            choiceMode: 'checkbox',
            keyMode: 'numbers',
            choices: [
              {
                correct: true,
                value: 'sorrow',
                label: 'Sorrow',
                feedback: {
                  type: 'none',
                  value: ''
                }
              },
              {
                value: 'contemplation',
                label: 'Contemplation',
                feedback: {
                  type: 'none',
                  value: ''
                }
              },
              {
                value: 'loneliness',
                label: 'Loneliness',
                feedback: {
                  type: 'none',
                  value: ''
                }
              },
              {
                correct: true,
                value: 'envy',
                label: 'Envy',
                feedback: {
                  type: 'none',
                  value: ''
                }
              }
            ],
            partialScoring: false,
            partialScoringLabel: `Each correct response that is correctly checked and each incorrect response
              that is correctly unchecked will be worth 1 point.
              The maximum points is the total number of answer choices.`
          }
        ],
        markup: `
            <pie-multiple-choice id='1'></pie-multiple-choice>
          `
      };
@Component({
  tag: "item-preview-tool",
  styleUrls: ["item-preview-tool.scss"]
})
export class ItemPreviewTool {
  @State() config: any;

  @Prop() text:string = JSON.stringify(demoItem, null, "  ")

  @State() notValid : boolean;

  componentDidLoad() {

    this.applyUpdate()
  }


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
            <div class="info">You can add json or js objects below, Ctrl+Enter to update</div>
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

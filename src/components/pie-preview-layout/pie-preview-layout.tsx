import { Component, State, Watch, Prop, h } from '@stencil/core';
import { MDCTabBar } from '@material/tab-bar';
import { ItemConfig } from '../../interface';
import { ModelUpdatedEvent } from '@pie-framework/pie-configure-events';


// TODO sticky mdc focus workaround https://github.com/prateekbh/preact-material-components/issues/625

@Component({ 
  tag: 'pie-preview-layout', 
  styleUrls: [
    "pie-preview-layout.scss"
  ]})
export class PiePreviewLayout {

  tabElement: HTMLDivElement;
  designElement: HTMLDivElement;
  previewElement: HTMLDivElement;
  piePlayerElement: HTMLPiePlayerElement;
  tabBar: MDCTabBar;

  @State()
  activeIndex: number = 0;

  @Prop() config: Object;
   

  @Watch('activeIndex')
  watchActiveIndex(newVal) {
    if (newVal ===1) {
      this.previewElement.style.display = 'block';
      this.designElement.style.display = 'none';
    } else {
      this.previewElement.style.display = 'none';
      this.designElement.style.display = 'block';
    }
  }

  componentDidLoad() {
    console.log(`component did load called`);
    this.tabBar = new MDCTabBar(this.tabElement);
    this.tabBar.useAutomaticActivation;
    this.tabBar.focusOnActivate = false;
    this.tabElement.addEventListener('MDCTabBar:activated', this.handleActivated.bind(this));
    this.designElement.addEventListener(ModelUpdatedEvent.TYPE, this.handleModelUpdated.bind(this));
  }


  handleActivated(ev) {
    this.activeIndex = ev.detail.index;
  }

  async handleModelUpdated(ev) {
    console.log(`model updated caught`);
    const {reset, update} = ev.detail;
    reset === true;// TODO - not sure what reset true does
    
    await this.piePlayerElement.updateElementModel(update);

  }

  render() {
    return (
      <div class="author-preview-container">
        {/* tab bar */}
        <div ref={(el) => this.tabElement = el as HTMLDivElement} class="mdc-tab-bar author-preview-tab-bar" role="tablist">
          <div class="mdc-tab-scroller">
            <div class="mdc-tab-scroller__scroll-area">
              <div class="mdc-tab-scroller__scroll-content">
                <button
                  class="mdc-tab mdc-tab--active"
                  role="tab"
                  aria-selected="true"
                  tabindex="0"
                >
                  <span class="mdc-tab__content">
                    <span class="mdc-tab__text-label">Build</span>
                  </span>
                  <span class="mdc-tab-indicator mdc-tab-indicator--active">
                    <span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline" />
                  </span>
                  <span class="mdc-tab__ripple" />
                </button>

                <button
                  class="mdc-tab"
                  role="tab"
                  aria-selected="true"
                  tabindex="1"
                >
                  <span class="mdc-tab__content">
                    <span class="mdc-tab__text-label">Item Preview</span>
                  </span>
                  <span class="mdc-tab-indicator">
                    <span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline" />
                  </span>
                  <span class="mdc-tab__ripple" />
                </button>


              </div>
            </div>
          </div>
        </div>
        {/* tab content */}
        <div class="author-preview-tab-contents">

            <div 
              ref={(el) => this.designElement = el as HTMLDivElement}
              >
              <slot 
                name='configure' />
            </div>

            <div 
              style={{display: 'none'}}
              ref={(el) => this.previewElement = el as HTMLDivElement}
              >
              <div class="preview-control">
                <pie-preview-control onEnvChanged={(ev) => {
                  this.piePlayerElement.env = {mode: ev.detail.mode, role: ev.detail.role};
                }}
                  ></pie-preview-control>  
              </div>
              <div class="pie-player">
                <pie-player
                  ref={(el) => this.piePlayerElement = el as HTMLPiePlayerElement}
                  config={this.config as ItemConfig}></pie-player>
              </div>
            </div>
           

        </div>
      </div>
    );
  }
}

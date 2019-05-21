import { Component, Event, EventEmitter } from '@stencil/core';
import { MDCSelect } from '@material/select';
import {MDCSwitch} from '@material/switch';
import { patchMDCSwitchFocus } from '../../utils/utils';





@Component({ 
  tag: 'pie-preview-control', 
  styleUrls: [
    "pie-preview-control.scss"
  ]})
export class PiePreviewControl {

  roleSelectElement: HTMLDivElement;
  roleSelect: MDCSelect;   
  checkAnswersElement: HTMLDivElement;
  checkAnswers: MDCSwitch;
  env = {
    mode: 'gather',
    role: 'student'
  }

  @Event() envChanged: EventEmitter;

  componentDidLoad() {
    console.log(`component did load called`);
    this.roleSelect = new MDCSelect(this.roleSelectElement);
    this.checkAnswers = new MDCSwitch(this.checkAnswersElement);

    patchMDCSwitchFocus(this.checkAnswersElement);

    this.checkAnswers.listen('change', () =>{
      this.checkAnswers.checked ? this.env.mode = 'evaluate' : this.env.mode = 'gather'; 
      console.log('control env upated to' + JSON.stringify(this.env));
      this.envChanged.emit(this.env);
    });

    this.roleSelect.listen('MDCSelect:change', () => {
      
      // sticky mdc focus workaround https://github.com/prateekbh/preact-material-components/issues/625
      this.roleSelect.root_.classList.remove(`mdc-select--focused`);

      this.env.role = this.roleSelect.value;
      this.envChanged.emit(this.env);
    });
  }


  render() {
    return (
      <div class="preview-control-container">
        <div ref={(el) => this.roleSelectElement = el as HTMLDivElement} class="mdc-select demo-width-class pie-role-select">
          {/* <input type="hidden" name="enhanced-select"> */}
          <i class="mdc-select__dropdown-icon"></i>
          <div class="mdc-select__selected-text">Student</div>
          <div class="mdc-select__menu mdc-menu mdc-menu-surface demo-width-class">
            <ul class="mdc-list">
              <li class="mdc-list-item  mdc-list-item--selected" aria-selected="true" data-value="student">
                Student
              </li>
              <li class="mdc-list-item" data-value="instructor">
                Instructor
              </li>
            </ul>
          </div>
          <span class="mdc-floating-label mdc-floating-label--float-above">Role</span>
          <div class="mdc-line-ripple"></div>
        </div>
        <div class="pie-check-answers">
          <div ref={(el) => this.checkAnswersElement = el as HTMLDivElement} class="mdc-switch">
            <div class="mdc-switch__track"></div>
            <div class="mdc-switch__thumb-underlay">
              <div class="mdc-switch__thumb">
                  <input type="checkbox" id="basic-switch" class="mdc-switch__native-control" role="switch"></input>
              </div>
            </div>
          </div>
          <label htmlFor="basic-switch">Check Answers</label>
        </div>
      </div>
    );
  }
}

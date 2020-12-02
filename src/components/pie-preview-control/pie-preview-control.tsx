import { Component, Event, EventEmitter, h, State } from "@stencil/core";
import { MDCSwitch } from "@material/switch";
import { patchMDCSwitchFocus } from "../../utils/utils";

@Component({
  tag: "pie-preview-control",
  styleUrls: ["pie-preview-control.scss"],
})
export class PiePreviewControl {
  checkAnswersElement: HTMLDivElement;
  checkAnswers: MDCSwitch;

  roleOptions = [
    { label: "Student", value: "student" },
    { label: "Instructor", value: "instructor" },
  ];

  @State()
  role: string = "student";

  @State()
  mode: string = "gather";

  @Event() envChanged: EventEmitter;

  roleChanged = (e: CustomEvent<string>) => {
    this.role = e.detail;
    this.envChanged.emit({ role: this.role, mode: this.mode });
  };

  componentDidLoad() {
    this.checkAnswers = new MDCSwitch(this.checkAnswersElement);

    patchMDCSwitchFocus(this.checkAnswersElement);

    this.checkAnswers.listen("change", () => {
      this.checkAnswers.checked
        ? (this.mode = "evaluate")
        : (this.mode = "gather");
      this.envChanged.emit({ mode: this.mode, role: this.role });
    });
  }

  render() {
    return (
      <div class="preview-control-container">
        <mdc-select
          options={this.roleOptions}
          prompt={"Role"}
          onValueChanged={this.roleChanged}
          value={this.role}
        ></mdc-select>
        <div class="pie-check-answers">
          <div
            ref={(el) => (this.checkAnswersElement = el as HTMLDivElement)}
            class="mdc-switch"
          >
            <div class="mdc-switch__track"></div>
            <div class="mdc-switch__thumb-underlay">
              <div class="mdc-switch__thumb">
                <input
                  type="checkbox"
                  id="basic-switch"
                  class="mdc-switch__native-control"
                  role="switch"
                ></input>
              </div>
            </div>
          </div>
          <label htmlFor="basic-switch">Check Answers</label>
        </div>
      </div>
    );
  }
}

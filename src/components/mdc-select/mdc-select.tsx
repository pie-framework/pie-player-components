import { Component, Event, EventEmitter, h, Prop } from "@stencil/core";
import { MDCSelect as Select } from "@material/select";

const SelectDropdown = (props) => {
  return (
    <div
      class="mdc-select__anchor"
      role="button"
      aria-haspopup="listbox"
      aria-expanded="false"
      aria-labelledby="comp-label comp-selected-text"
    >
      <span class="mdc-select__ripple"></span>
      <span id="comp-label" class="mdc-floating-label">
        {props.prompt}
      </span>
      <span class="mdc-select__selected-text-container">
        <span id="comp-selected-text" class="mdc-select__selected-text">
          {props.selected}
        </span>
      </span>
      <span class="mdc-select__dropdown-icon">
        <svg
          class="mdc-select__dropdown-icon-graphic"
          viewBox="7 10 10 5"
          focusable="false"
        >
          <polygon
            class="mdc-select__dropdown-icon-inactive"
            stroke="none"
            fill-rule="evenodd"
            points="7 10 12 15 17 10"
          ></polygon>
          <polygon
            class="mdc-select__dropdown-icon-active"
            stroke="none"
            fill-rule="evenodd"
            points="7 15 12 10 17 15"
          ></polygon>
        </svg>
      </span>
      <span class="mdc-line-ripple"></span>
    </div>
  );
};

const Li = (props) => {
  const className = `mdc-list-item ${
    props.selected ? "mdc-list-item--selected" : ""
  }}`;

  return (
    <li
      class={className}
      aria-selected={props.selected}
      data-value={props.value}
      role="option"
    >
      <span class="mdc-list-item__ripple"></span>
      <span class="mdc-list-item__text">{props.label}</span>
    </li>
  );
};

export type Option = {
  label: string;
  value: string;
};

@Component({
  tag: "mdc-select",
  styleUrls: ["mdc-select.scss"],
})
export class MdcSelect {
  root: HTMLDivElement;

  @Prop()
  prompt: string;

  @Prop()
  options: Option[];

  @Prop()
  value: string;

  @Event() valueChanged: EventEmitter<string>;

  componentDidLoad() {
    const select = new Select(this.root);

    select.selectedIndex = this.options.findIndex(
      (o) => (o.value = this.value)
    );

    select.listen("MDCSelect:change", () => {
      this.valueChanged.emit(this.options[select.selectedIndex].value);
    });
  }

  getSelectedLabel() {
    const o = this.options.find((o) => o.value === this.value);
    return o.label;
  }

  render() {
    return (
      <div
        ref={(r) => (this.root = r)}
        class="mdc-select mdc-select--filled comp-width-class"
      >
        <SelectDropdown
          prompt={this.prompt}
          selected={this.getSelectedLabel()}
        />

        <div class="mdc-select__menu mdc-menu mdc-menu-surface mdc-menu-surface--fullwidth">
          <ul class="mdc-list" role="listbox" aria-label="picker listbox">
            {(this.options || []).map((o) => (
              <Li
                label={o.label}
                value={o.value}
                selected={this.value === o.value}
              />
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

import { Component, Prop, h } from '@stencil/core';

@Component({ tag: 'pie-spinner' , styleUrl: 'pie-spinner.css'})
export class PieSpinner {

  /**
   * Shows the spinner
   */
  @Prop() active: boolean = true;

  render() {
    return (
      <div>
        {!this.active && <slot/>}
        { this.active ?
        <div id="pie-spinner-container">
        <div id="pie-spinner">
          <svg
            class="lds-spinner"
            width="200px"
            height="200px"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid"
          >
            <g transform="rotate(0 50 50)">
              <rect
                x="47"
                y="22.5"
                rx="9.4"
                ry="4.5"
                width="6"
                height="15"
                fill="#677179"
              >
                <animate
                  attributeName="opacity"
                  values="1;0"
                  keyTimes="0;1"
                  dur="1.3s"
                  begin="-1.1916666666666667s"
                  repeatCount="indefinite"
                />
              </rect>
            </g>
            <g transform="rotate(30 50 50)">
              <rect
                x="47"
                y="22.5"
                rx="9.4"
                ry="4.5"
                width="6"
                height="15"
                fill="#677179"
              >
                <animate
                  attributeName="opacity"
                  values="1;0"
                  keyTimes="0;1"
                  dur="1.3s"
                  begin="-1.0833333333333333s"
                  repeatCount="indefinite"
                />
              </rect>
            </g>
            <g transform="rotate(60 50 50)">
              <rect
                x="47"
                y="22.5"
                rx="9.4"
                ry="4.5"
                width="6"
                height="15"
                fill="#677179"
              >
                <animate
                  attributeName="opacity"
                  values="1;0"
                  keyTimes="0;1"
                  dur="1.3s"
                  begin="-0.9750000000000001s"
                  repeatCount="indefinite"
                />
              </rect>
            </g>
            <g transform="rotate(90 50 50)">
              <rect
                x="47"
                y="22.5"
                rx="9.4"
                ry="4.5"
                width="6"
                height="15"
                fill="#677179"
              >
                <animate
                  attributeName="opacity"
                  values="1;0"
                  keyTimes="0;1"
                  dur="1.3s"
                  begin="-0.8666666666666667s"
                  repeatCount="indefinite"
                />
              </rect>
            </g>
            <g transform="rotate(120 50 50)">
              <rect
                x="47"
                y="22.5"
                rx="9.4"
                ry="4.5"
                width="6"
                height="15"
                fill="#677179"
              >
                <animate
                  attributeName="opacity"
                  values="1;0"
                  keyTimes="0;1"
                  dur="1.3s"
                  begin="-0.7583333333333333s"
                  repeatCount="indefinite"
                />
              </rect>
            </g>
            <g transform="rotate(150 50 50)">
              <rect
                x="47"
                y="22.5"
                rx="9.4"
                ry="4.5"
                width="6"
                height="15"
                fill="#677179"
              >
                <animate
                  attributeName="opacity"
                  values="1;0"
                  keyTimes="0;1"
                  dur="1.3s"
                  begin="-0.65s"
                  repeatCount="indefinite"
                />
              </rect>
            </g>
            <g transform="rotate(180 50 50)">
              <rect
                x="47"
                y="22.5"
                rx="9.4"
                ry="4.5"
                width="6"
                height="15"
                fill="#677179"
              >
                <animate
                  attributeName="opacity"
                  values="1;0"
                  keyTimes="0;1"
                  dur="1.3s"
                  begin="-0.5416666666666666s"
                  repeatCount="indefinite"
                />
              </rect>
            </g>
            <g transform="rotate(210 50 50)">
              <rect
                x="47"
                y="22.5"
                rx="9.4"
                ry="4.5"
                width="6"
                height="15"
                fill="#677179"
              >
                <animate
                  attributeName="opacity"
                  values="1;0"
                  keyTimes="0;1"
                  dur="1.3s"
                  begin="-0.43333333333333335s"
                  repeatCount="indefinite"
                />
              </rect>
            </g>
            <g transform="rotate(240 50 50)">
              <rect
                x="47"
                y="22.5"
                rx="9.4"
                ry="4.5"
                width="6"
                height="15"
                fill="#677179"
              >
                <animate
                  attributeName="opacity"
                  values="1;0"
                  keyTimes="0;1"
                  dur="1.3s"
                  begin="-0.325s"
                  repeatCount="indefinite"
                />
              </rect>
            </g>
            <g transform="rotate(270 50 50)">
              <rect
                x="47"
                y="22.5"
                rx="9.4"
                ry="4.5"
                width="6"
                height="15"
                fill="#677179"
              >
                <animate
                  attributeName="opacity"
                  values="1;0"
                  keyTimes="0;1"
                  dur="1.3s"
                  begin="-0.21666666666666667s"
                  repeatCount="indefinite"
                />
              </rect>
            </g>
            <g transform="rotate(300 50 50)">
              <rect
                x="47"
                y="22.5"
                rx="9.4"
                ry="4.5"
                width="6"
                height="15"
                fill="#677179"
              >
                <animate
                  attributeName="opacity"
                  values="1;0"
                  keyTimes="0;1"
                  dur="1.3s"
                  begin="-0.10833333333333334s"
                  repeatCount="indefinite"
                />
              </rect>
            </g>
            <g transform="rotate(330 50 50)">
              <rect
                x="47"
                y="22.5"
                rx="9.4"
                ry="4.5"
                width="6"
                height="15"
                fill="#677179"
              >
                <animate
                  attributeName="opacity"
                  values="1;0"
                  keyTimes="0;1"
                  dur="1.3s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </rect>
            </g>
          </svg>
        </div>
      </div>
        :
        <div></div>
        }

      </div>
    );
  }
}

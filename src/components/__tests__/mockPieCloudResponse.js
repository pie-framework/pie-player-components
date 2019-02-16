console.log(`---------- evaluated MockElement`);
/*
 *  This mocks the code structure that would be returned from pie cloud service
 */
class MockElement extends HTMLElement {
  constructor() {
    console.log(`---------- constructing MockElement`);

    super();

  }
  set model(val) {
    if (val) {
      this.setAttribute('model', 'true');
    } else {
      this.removeAttribute('model');
    }
  }
  get model() {
    return this.hasAttribute('model');
  }
}

class MockConfig extends HTMLElement {
  constructor() {

    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const name = this.getAttribute('name');
    const helloEl = document.createElement('div');
    helloEl.textContent = "hello pie" + name;
    shadow.appendChild(helloEl);
  }
}

const controller = {
  model: (config, session, env) => {
    return {model:true}
  },
  outcome: (config, session, env) => {
  }
}



window['pie'] = {
  default: {
    '@pie-element/multiple-choice': {
      Element: MockElement,
      Configure: MockConfig,
      controller
    }
  }
};


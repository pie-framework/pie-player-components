(function(){
function createContent(el) {
  const shadow = el.attachShadow({ mode: 'open' });
  const name = el.getAttribute('name');
  const helloEl = document.createElement('div');
  helloEl.textContent = "hello pie" + name;
  shadow.appendChild(helloEl);
}


/*
 *  This mocks the code structure that would be returned from pie cloud service
 */
class MockElement extends HTMLElement {
  constructor() {
    super();
    createContent(this);
  }
  set model(val) {
    this._model = val;
    if (val) {
      this.setAttribute('model', 'true');
    } else {
      this.removeAttribute('model');
    }
  }
  get model() {
    return this._model;
  }
}

class MockConfig extends HTMLElement {
  constructor() {
    super();
    createContent(this);
  }
}

const controller = {
  model: (config, session, env) => {
    return {model:config, session, env};
  },
  outcome: (config, session, env) => {
  }
}

class MultipleChoice extends MockElement {}
class MultipleChoiceConfig extends MockConfig {}
class InlineChoice extends MockElement {}
class InlineChoiceConfig extends MockConfig {}
class MathInline extends MockElement {}
class MathInlineConfig extends MockConfig {}
class Passage extends MockElement {}



window['pie'] = {
  default: {
    '@pie-element/multiple-choice': {
      Element: MultipleChoice,
      Configure: MultipleChoiceConfig,
      controller
    },
    '@pie-element/inline-choice': {
      Element: InlineChoice,
      Configure: InlineChoiceConfig,
      controller
    },
    '@pie-element/math-inline': {
      Element: MathInline,
      Configure: MathInlineConfig,
      controller
    },
    '@pie-element/passage': {
      Element: Passage
    }
  }
};

})()
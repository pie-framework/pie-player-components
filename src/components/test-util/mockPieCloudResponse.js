
(function(){
function createContent(el) {
  el.innerHTML = `<div id="pie-content">hello pie!</div>`
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

  set session(val) {
    this._session = val;
    if (val) {
      this.setAttribute('session', 'true');
      this.dispatchEvent(new CustomEvent('session-changed', {detail: "mock event"}));
    } else {
      this.removeAttribute('session');
    }
  }
  get session() {
    return this._sessionl;
  }
}

class MockConfig extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `<div id="pie-content">hello pie!</div>`
  }

  set model(val) {
    this._model = val;
    if (val) {
      this.setAttribute('model', 'true');
      this.innerHTML = `<div id="pie-content">hello pie with model!</div>`
    } else {
      this.removeAttribute('model');
    }
  }
  get model() {
    return this._model;
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
class Rubric extends MockElement {}
class RubricConfig extends MockConfig {}



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
    '@pie-element/rubric': {
      Element: Rubric,
      Configure: RubricConfig,
      controller
    },
    '@pie-element/passage': {
      Element: Passage
    }
  }
};

})()
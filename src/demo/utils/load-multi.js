const availablePies = {
  'pie-multiple-choice': {
    name: 'Multiple Choice',
    piePackage: '@pie-element/multiple-choice',
    defaults: {
      choiceMode: 'radio'
    }
  },
  'pie-multiple-select': {
    name: 'Multiple Select',
    piePackage: '@pie-element/multiple-choice',
    defaults: {
      choiceMode: 'checkbox'
    }
  },
  'pie-constructed-response': {
    name: 'Constructed Response',
    piePackage: '@pie-element/extended-text-entry'
  },
  'pie-ordering': {
    name: 'Ordering',
    piePackage: '@pie-element/placement-ordering'
  },
  'pie-categorize': {
    name: 'Categorize',
    piePackage: '@pie-element/categorize'
  },
  'pie-equation-response': {
    name: 'Equation Response',
    piePackage: '@pie-element/math-inline'
  }
};

function getModel(tagName) {
  function guidGenerator() {
    // Creates simple ids - they only need to be unique within the current model.
    var S4 = function() {
      // http://guid.us/GUID/JavaScript
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return `p-${S4() + S4()}`;
  }

  const pieDefinition = availablePies[tagName];

  if (!pieDefinition) return;

  const id = guidGenerator();

  return {
    id,
    elements: { [tagName]: pieDefinition.piePackage + '@latest' },
    models: [{ id, ...pieDefinition.defaults }],
    markup: `<${tagName} id="${id}"></${tagName}>`
  };
}

const author = document.getElementById('author');
const model = getModel(Object.keys(availablePies)[0]);

author.config = model;

Object.keys(availablePies).forEach(key => {
  const button = document.createElement('button');

  button.selected = true;
  button.id = key;
  button.label = key;
  button.textContent = key;
  button.onclick = () => author.config = getModel(key);;
  document.getElementById("changePies").appendChild(button);
});

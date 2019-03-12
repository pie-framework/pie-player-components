// TODO - this is temporary polyfill for missing function implementationns.

export const createConfigFunctions = {};

createConfigFunctions['@pie-element/multiple-choice'] = model => {
  console.warn(`polyfilling createConfigFunction --- @pie-elements/mulitple-choice`);
  return {...{
    element: 'pie-multiple-choice',
    prompt: 'Question Prompt',
    choiceMode: 'checkbox',
    keyMode: 'numbers',
    choices: [
      {
        correct: true,
        value: 'choiceOne',
        label: 'Choice One',
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
  }, ...model };
};


createConfigFunctions['@pie-element/extended-text-entry'] = model => {
  console.warn(`polyfilling createConfigFunction --- @pie-elements/extended-text-entry`);
  return {...{
    feedback: { type: 'default', default: 'this is default feedback' },
    width: '500px',
    prompt: 'This is the question prompt',
    showMathInput: false
    }, ...model };
};


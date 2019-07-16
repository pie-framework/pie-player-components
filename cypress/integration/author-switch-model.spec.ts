/// <reference types="Cypress" />


const newConfig = {
  id: '1',
  elements: {
    'pie-multiple-choice': '@pie-element/multiple-choice@3.5.4'
  },
  models: [
    {
      id: '1',
      element: 'pie-multiple-choice',
      prompt: 'What is the theme of this poem?',
      choiceMode: 'checkbox',
      keyMode: 'numbers',
      choices: [
        {
          correct: true,
          value: 'sorrow',
          label: 'Sorrow',
          feedback: {
            type: 'none',
            value: ''
          }
        },
      ],
      partialScoring: false,
      partialScoringLabel: `Each correct response that is correctly checked and each incorrect response
        that is correctly unchecked will be worth 1 point.
        The maximum points is the total number of answer choices.`
    }
  ],
  markup: `
      <pie-multiple-choice id='1'></pie-multiple-choice>
    `
};

context('Author Switch', () => {
  beforeEach(() => {
    // TODO replace with base url
    cy.visit('http://localhost:8081/demo/cypress/author-switch-model.html')
  })

  it('loads config', () => {
    cy.get('pie-author:defined').should($player => {
      $player.prop('config', (i, oldVal) => {
        expect(oldVal).to.not.be.undefined;
        expect(oldVal.models[0].prompt).to.eq('What is the theme of this poem?')

        return newConfig;

      })
    })

  })

})

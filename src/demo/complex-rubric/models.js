const PASSAGE_model = {
  id: "p-passage",
  element: "pie-passage",
  passages: [
    {
      title: "Temperature Control and Chocolate Sculptures",
      text: "<h3>What is Lorem Ipsum?</h3><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>"
    }
  ]
};
const COMPLEX_RUBRIC_model = {
  id: "p-c-rubric",
  element: "pp-pie-element-complex-rubric",
  rubrics: {
    simpleRubric: {},
    multiTraitRubric: {
      visibleToStudent: true,
      halfScoring: true,
      pointLabels: true,
      description: false,
      standards: false,
      scales: [
        {
          excludeZero: false,
          maxPoints: 1,
          scorePointsLabels: [
            "<div>b</div>",
            "<div>a</div>"
          ],
          traitLabel: "",
          traits: [
            {
              name: "<div>s</div>",
              description: "",
              standards: [],
              scorePointsDescriptors: [
                "<div>sa</div>",
                "<div>sc</div>"
              ]
            }
          ]
        }
      ],
      excludeZero: false,
      maxPointsEnabled: true,
      addScaleEnabled: true
    },
  },
  rubricType: "multiTraitRubric"

};

const modelMC = (id, extra) => ({
  id,
  element: 'pie-multiple-choice',
  ...extra
});

const configSettings = (extra) => ({
  '@pie-element/multiple-choice': {
    withRubric: { settings: true, label: 'Add Rubric' }
  },
  ...extra
});

const itemConfigWithStimulus = ({ models, elements, markup, defaultExtraModels }) => ({
  pie: {
    id: "1",
    elements,
    models,
    markup,
  },
  stimulus: {
    id: "2",
    elements: {
      'pie-passage': "@pie-element/passage@1.7.8"
    },
    layout: "left",
    models: [PASSAGE_model],
    markup: "<pie-passage id=\"p-passage\"></pie-passage>",
  },
  defaultExtraModels
});

// label: 'Simple Item (multiple-choice). Ability to toggle rubric.'

// const userCases = {
//     label: 'Simple Item (multiple-choice). Ability to toggle rubric.'
// };

// const edgeCases = {
//
// };

const useCases = {
  I: {
    label: 'Simple MC Item. Ability to Add Rubric.',
    config: {
      id: '1',
      elements: {
        'pie-multiple-choice': '@pie-element/multiple-choice'
      },
      models: [modelMC("1")],
      markup: "<pie-multiple-choice id='1'></pie-multiple-choice>"
    },
    configSettings: {
      '@pie-element/multiple-choice': {
        withRubric: { settings: true, label: 'Add Rubric' }
      }
    }
  },
  II: {
    label: 'Multi MC Item. Ability to Add Rubric.',
    config: {
      id: '1',
      elements: {
        'pie-multiple-choice': '@pie-element/multiple-choice'
      },
      models: [modelMC("1"), modelMC("2")],
      markup: "<pie-multiple-choice id='1'></pie-multiple-choice><pie-multiple-choice id='2'></pie-multiple-choice>"
    },
    configSettings: {
      '@pie-element/multiple-choice': {
        withRubric: { settings: true, label: 'Add Rubric' }
      }
    }
  },
  III: {
    config: {
      id: "1",
      elements: {
        "pp-pie-element-multiple-choice": "@pie-element/multiple-choice",
      },
      models: [modelMC("1"), modelMC("2", { rubricEnabled: true })],
      markup: "<pp-pie-element-multiple-choice id='1'></pp-pie-element-multiple-choice><pp-pie-element-multiple-choice id='2'></pp-pie-element-multiple-choice>"
    },
    configSettings: {
      '@pie-element/multiple-choice': {
        withRubric: { settings: true, label: 'Add Rubric' }
      }
    }
  },
  IV: {
    config: {
      id: "1",
      elements: {
        "pp-pie-element-multiple-choice": "@pie-element/multiple-choice",
        "pp-pie-element-complex-rubric": "@pie-element/complex-rubric"
      },
      models: [modelMC("1"), modelMC("2", { rubricEnabled: true }), COMPLEX_RUBRIC_model],
      markup: "<pp-pie-element-multiple-choice id='1'></pp-pie-element-multiple-choice><pp-pie-element-multiple-choice id='2'></pp-pie-element-multiple-choice><div style=\"width: 75%\"><pp-pie-element-complex-rubric id=\"p-rubric\"></pp-pie-element-complex-rubric></div>"
    },
    configSettings: {
      '@pie-element/multiple-choice': {
        withRubric: { settings: true, label: 'Add Rubric' }
      }
    }
  },
  V: {
    config: itemConfigWithStimulus({
      models: [modelMC("1"), modelMC("2"), COMPLEX_RUBRIC_model],
      elements: {
        'multiple-choice': "@pie-element/multiple-choice",
        'pp-pie-element-complex-rubric': "@pie-element/complex-rubric"
      },
      markup: "<multiple-choice id=\"1\"></multiple-choice><multiple-choice id=\"2\"></multiple-choice><pp-pie-element-complex-rubric id=\"p-c-rubric\"></pp-pie-element-complex-rubric>"
    }),
    configSettings: {
      '@pie-element/multiple-choice': {
        withRubric: { settings: true, label: 'Add Rubric' }
      }
    }
  },
  VI: {
    config: itemConfigWithStimulus({
      models: [modelMC("1"), modelMC("2", { rubricEnabled: true })],
      elements: {
        "multiple-choice": "@pie-element/multiple-choice",
      },
      markup: "<multiple-choice id=\"1\"></multiple-choice><multiple-choice id=\"2\"></multiple-choice>"
    }),
    configSettings: {
      '@pie-element/multiple-choice': {
        withRubric: { settings: true, label: 'Add Rubric' }
      }
    }
  },
  VII: {
    config: itemConfigWithStimulus({
      models: [modelMC("1"), modelMC("2")],
      elements: {
        "multiple-choice": "@pie-element/multiple-choice",
      },
      markup: "<multiple-choice id=\"1\"></multiple-choice><multiple-choice id=\"2\"></multiple-choice>"
    }),
    configSettings: {
      '@pie-element/multiple-choice': {
        withRubric: { settings: true, label: 'Add Rubric' }
      }
    }
  },
  VIII: {
    config: {
      id: '1',
      elements: {
        'pie-multiple-choice': '@pie-element/multiple-choice'
      },
      models: [{
        id: '1',
        element: 'pie-multiple-choice',
      }],
      markup: "<pie-multiple-choice id='1'></pie-multiple-choice>"
    },
    configSettings: {
      '@pie-element/multiple-choice': {
        withRubric: { settings: true, label: 'Add Rubric', forceEnabled: true }
      }
    }
  },
  IX: {
    config: {
      "models": [COMPLEX_RUBRIC_model],
      "elements": {
        "pp-pie-element-complex-rubric": "@pie-element/complex-rubric"
      },
      "id": "1",
      "markup": "<pp-pie-element-complex-rubric id=\"p-9c9ded01\"></pp-pie-element-complex-rubric>"
    },
    configSettings: {}
  },
  X: {
    config: {
      "models": [modelMC("1"), modelMC("2"), COMPLEX_RUBRIC_model],
      "elements": {
        "multiple-choice": "@pie-element/multiple-choice",
        "pp-pie-element-complex-rubric": "@pie-element/complex-rubric"
      },
      "id": "1",
      "markup": "<multiple-choice id=\"1\"></multiple-choice><multiple-choice id=\"2\"></multiple-choice><pp-pie-element-complex-rubric id=\"p-9c9ded01\"></pp-pie-element-complex-rubric>"
    },
    configSettings: {
      '@pie-element/multiple-choice': {
        withRubric: { settings: true, label: 'Add Rubric' }
      }
    }
  },
  XI: {
    config: {
      "models": [
        {
          ...modelMC("1",
            // CASE 2 => rubricEnabled: true
            { rubricEnabled: true }
          ),
        },
        modelMC("2"),
        COMPLEX_RUBRIC_model
      ],
      "elements": {
        "multiple-choice": "@pie-element/multiple-choice",
        "pp-pie-element-complex-rubric": "@pie-element/complex-rubric"
      },
      "id": "1",
      "markup": "<multiple-choice id=\"1\"></multiple-choice><multiple-choice id=\"2\"></multiple-choice><pp-pie-element-complex-rubric id=\"p-9c9ded01\"></pp-pie-element-complex-rubric>"
    },
    configSettings: {
      '@pie-element/multiple-choice': {
        withRubric: { settings: true, label: 'Add Rubric' }
      }
    }
  },
  XII: {
    config: {
      "models": [modelMC("1"), modelMC("2"), COMPLEX_RUBRIC_model],
      "elements": {
        "multiple-choice": "@pie-element/multiple-choice",
        "pp-pie-element-complex-rubric": "@pie-element/complex-rubric"
      },
      "id": "1",
      "markup": "<multiple-choice id=\"1\"></multiple-choice><multiple-choice id=\"2\"></multiple-choice><pp-pie-element-complex-rubric id=\"p-9c9ded01\"></pp-pie-element-complex-rubric>"
    },
    configSettings: {
      '@pie-element/multiple-choice': {
        prompt: { settings: true, label: 'Prompt', enabled: true },
        withRubric: {
          settings: true,
          label: 'Add Rubric..',
          // CASE 1 => forceEnabled: true
          forceEnabled: true
        }
      }
    }
  },
  XIII: {
    config: {
      models: [modelMC("1"), modelMC("2")],
      elements: {
        "multiple-choice": "@pie-element/multiple-choice",
      },
      id: "1",
      markup: "<multiple-choice id=\"1\"></multiple-choice><multiple-choice id=\"2\"></multiple-choice>",
      defaultExtraModels: {
        'complex-rubric': COMPLEX_RUBRIC_model
      }
    },
    configSettings: {
      '@pie-element/multiple-choice': {
        prompt: { settings: true, label: 'Prompt', enabled: true },
        withRubric: {
          settings: true,
          label: 'Add Rubric..',
          // CASE 1 => forceEnabled: true
          forceEnabled: true
        }
      }
    }
  },
  XIV: {
    config: {
      id: '1',
      elements: {
        'pie-multiple-choice': '@pie-element/multiple-choice'
      },
      models: [modelMC("1")],
      markup: "<pie-multiple-choice id='1'></pie-multiple-choice>",
      defaultExtraModels: {
        'complex-rubric': {
          rubrics: {
            simpleRubric: {},
            multiTraitRubric: {
              visibleToStudent: true,
              halfScoring: true,
              pointLabels: true,
              description: false,
              standards: false,
              scales: [
                {
                  excludeZero: false,
                  maxPoints: 1,
                  scorePointsLabels: ["<div>b</div>", "<div>a</div>"],
                  traitLabel: "",
                  traits: [
                    {
                      name: "<div>s</div>",
                      description: "",
                      standards: [],
                      scorePointsDescriptors: [
                        "<div>sa</div>",
                        "<div>sc</div>"
                      ]
                    }
                  ]
                }
              ],
              excludeZero: false,
              maxPointsEnabled: true,
              addScaleEnabled: true
            },
          },
          rubricType: "multiTraitRubric"
        }
      }
    },
    configSettings: {
      '@pie-element/multiple-choice': {
        withRubric: { settings: true, label: 'Add Rubric' }
      }
    }
  }
};


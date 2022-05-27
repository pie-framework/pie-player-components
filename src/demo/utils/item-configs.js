const authorSettings = {
	multiple_choice: {
		configSettings: {
			'@pie-element/multiple-choice': {
				answerChoiceCount: 4,
				addChoiceButton: {
					settings: true,
					label: 'Add Choice'
				},
				choiceMode: {
					settings: false,
					label: 'Response Type'
				},
				lockChoiceOrder: {
					settings: true,
					label: 'Lock Choice Order'
				},
				partialScoring: {
					settings: false,
					label: 'Allow Partial Scoring'
				},
				choicePrefix: {
					settings: true,
					label: 'Choice Labels'
				},
				deleteChoice: {
					settings: true
				},
				feedback: {
					settings: false,
					label: 'Student Feedback'
				},
				prompt: {
					settings: true,
					label: 'Item Stem'
				},
				rationale: {
					settings: true,
					label: 'Rationale'
				},
				studentInstructions: {
					settings: false,
					label: 'Student Instructions'
				},
				teacherInstructions: {
					settings: true,
					label: 'Teacher Instructions'
				}
			}
		},
		contentConfig: {
			id: 'p-00000000',
			elements: {
				'pie-multiple-choice': '@pie-element/multiple-choice@latest'
			},
			models: [
				{
					id: 'p-00000000',
					element: 'pie-multiple-choice',
					choices: [],
					choiceMode: 'radio',
					choicePrefix: 'letters',
					prompt: '',
					lockChoiceOrder: false,
					partialScoring: false,
					scoringType: 'auto',
					rationaleEnabled: false,
					teacherInstructionsEnabled: false,
					studentInstructionsEnabled: false,
					feedbackEnabled: false
				}
			],
			markup:
				'<pie-multiple-choice id="p-00000000"></pie-multiple-choice>'
		}
	},
	multiple_select: {
		configSettings: {
			'@pie-element/multiple-choice': {
				answerChoiceCount: 5,
				addChoiceButton: {
					settings: true,
					label: 'Add Choice'
				},
				choiceMode: {
					settings: false,
					label: 'Response Type'
				},
				lockChoiceOrder: {
					settings: true,
					label: 'Lock Choice Order'
				},
				partialScoring: {
					settings: false,
					label: 'Allow Partial Scoring'
				},
				choicePrefix: {
					settings: true,
					label: 'Choice Labels'
				},
				deleteChoice: {
					settings: true
				},
				feedback: {
					settings: false,
					label: 'Student Feedback'
				},
				prompt: {
					settings: true,
					label: 'Item Stem'
				},
				rationale: {
					settings: true,
					label: 'Rationale'
				},
				studentInstructions: {
					settings: false,
					label: 'Student Instructions'
				},
				teacherInstructions: {
					settings: true,
					label: 'Teacher Instructions'
				}
			}
		},
		contentConfig: {
			id: 'p-00000000',
			elements: {
				'pie-multiple-choice': '@pie-element/multiple-choice@latest'
			},
			models: [
				{
					id: 'p-00000000',
					element: 'pie-multiple-choice',
					choices: [],
					choiceMode: 'checkbox',
					choicePrefix: 'letters',
					prompt: '',
					lockChoiceOrder: false,
					partialScoring: false,
					scoringType: 'auto',
					rationaleEnabled: false,
					teacherInstructionsEnabled: false,
					studentInstructionsEnabled: false,
					feedbackEnabled: false
				}
			],
			markup:
				'<pie-multiple-choice id="p-00000000"></pie-multiple-choice>'
		}
	},
	constructed_response: {
		configSettings: {
			'@pie-element/extended-text-entry': {
				dimensions: {
					settings: true,
					label: 'Response Area Size'
				},
				equationEditor: {
					settings: true,
					label: '',
					enabled: true
				},
				feedback: {
					settings: false,
					label: 'Feedback'
				},
				mathInput: {
					settings: true,
					label: 'Equation Editor',
					enabled: false
				},
				multiple: {
					settings: false,
					label: 'Multiple Parts',
					enabled: false
				},
				studentInstructions: {
					settings: false,
					label: 'Student Instructions'
				},
				teacherInstructions: {
					settings: true,
					label: 'Teacher Instructions'
				},
				prompt: {
					settings: true,
					label: 'Item Stem'
				}
			}
		},
		contentConfig: {
			id: 'p-00000000',
			elements: {
				'pie-constructed-response':'@pie-element/extended-text-entry@latest'
			},
			models: [
				{
					id: 'p-00000000',
					element: 'pie-constructed-response',
					dimensions: { height: 100, width: 500 },
					prompt: '',
					mathInput: false,
					equationEditor: 'everything',
					feedbackEnabled: false,
					rationaleEnabled: false,
					promptEnabled: true,
					teacherInstructionsEnabled: false,
					studentInstructionsEnabled: false,
					feedback: {
						type: 'default',
						default: ''
					},
					showMathInput: false
				}
			],
			markup:
				'<pie-constructed-response id="p-00000000"></pie-constructed-response>'
		}
	},
	explicit_constructed_response: {
		configSettings: {
			'@pie-element/explicit-constructed-response': {
				prompt: {
					settings: true,
					label: 'Item Stem'
				},
				partialScoring: {
					settings: false,
					label: 'Allow Partial Scoring',
				},
				rationale: {
					settings: true,
					label: 'Rationale'
				},
				teacherInstructions: {
					settings: true,
					label: 'Teacher Instructions'
				}
			}
		},
		contentConfig: {
			id: 'p-00000000',
			elements: {
				'pie-explicit-constructed-response':
					'@pie-element/explicit-constructed-response@latest'
			},
			models: [
				{
					id: 'p-00000000',
					element: 'pie-explicit-constructed-response',
					disabled: false,
					mode: 'gather',
					prompt: '<div></div>',
					shuffle: true,
					choices: {},
					slateMarkup: '<div></div>',
					rationaleEnabled: false,
					promptEnabled: true,
					teacherInstructionsEnabled: false,
					studentInstructionsEnabled: false
				}
			],
			markup:
				'<pie-explicit-constructed-response id="p-00000000"></pie-explicit-constructed-response>'
		}
	},
	math_equation_response: {
		configSettings: {
			'@pie-element/math-inline': {
				responseType: {
					settings: false,
					label: 'Response type'
				},
				rationale: {
					settings: true,
					label: 'Rationale'
				},
				scoringType: {
					settings: false,
					label: 'Scoring Type'
				},
				studentInstructions: {
					settings: false,
					label: 'Student Instructions'
				},
				teacherInstructions: {
					settings: false,
					label: 'Teacher Instructions'
				},
				partialScoring: {
					settings: false,
					label: 'Allow Partial Scoring'
				},
				prompt: {
					settings: true,
					label: 'Prompt'
				},
				feedback: {
					"settings": true,
					"label": "Feedback"
				}
			}
		},
		contentConfig: {
			id: 'p-00000000',
			elements: {
				'pie-math-inline': '@pie-element/math-inline@latest'
			},
			models: [
				{
					id: 'p-00000000',
					partialScoring: false,
					responseType: 'Simple',
					element: 'pie-math-inline',
					equationEditor: '3',
					expression: '',
					rationale: '',
					prompt: '',
					responses: [
						{
							id: '1',
							answer: '',
							validation: 'literal'
						}
					],
					customKeys: [
						'\\left(\\right)',
						'\\frac{}{}',
						'x\\frac{}{}'
					],
					scoringType: 'auto',
					response: {
						answer: '',
						validation: 'literal',
					},
					feedbackEnabled: false,
					rationaleEnabled: false,
					promptEnabled: true,
					teacherInstructionsEnabled: false,
					studentInstructionsEnabled: false
				}
			],
			markup: '<pie-math-inline id="p-00000000"></pie-math-inline>'
		}
	},
	evidence_based_selected_response: {
		configSettings: {
			'@pie-element/ebsr': {
				addChoiceButton: {
					settings: true,
					label: 'Add Choice'
				},
				choiceMode: {
					settings: true,
					label: 'Response Type'
				},
				choicePrefix: {
					settings: true,
					label: 'Choice Labels'
				},
				deleteChoice: {
					settings: true
				},
				feedback: {
					settings: false,
					label: 'Feedback'
				},
				prompt: {
					settings: true,
					label: 'Item Stem'
				},
				lockChoiceOrder: {
					settings: true,
					label: 'Lock Choice Order'
				},
				partialScoring: {
					settings: false,
					label: 'Allow Partial Scoring',
					enabled: false
				},
				rationale: {
					settings: true,
					label: 'Rationale'
				},
				scoringType: {
					settings: false,
					label: 'Scoring Type'
				},
				studentInstructions: {
					settings: false,
					label: 'Student Instructions',
				},
				teacherInstructions: {
					settings: true,
					label: 'Teacher Instructions',
				},
				sequentialChoiceLabels: {
					settings: false,
					label: 'Sequential Choice Labels',
					enabled: false
				},
				partLabels: {
					settings: false,
					label: 'Part Labels',
					enabled: false
				},
				answerChoiceCount: 4
			}
		},
		contentConfig: {
			id: 'p-00000000',
			elements: {
				'pie-element-ebsr': '@pie-element/ebsr@latest'
			},
			models: [
				{
					id: 'p-00000000',
					element: 'pie-element-ebsr',
					partA: {
						choices: [],
						choiceMode: 'radio',
						choicePrefix: 'letters',
						prompt: '',
						lockChoiceOrder: false,
						partialScoring: false,
						scoringType: 'auto',
						keyMode: 'letters',
						partialScoringLabel: '',
						shuffle: false,
						showCorrect: false,
						allowFeedback: false,
						feedbackEnabled: false,
						promptEnabled: true,
						rationaleEnabled: false,
						teacherInstructionsEnabled: false,
						studentInstructionsEnabled: false
					},
					partB: {
						choices: [],
						choiceMode: 'checkbox',
						choicePrefix: 'letters',
						prompt: '',
						lockChoiceOrder: false,
						partialScoring: false,
						scoringType: 'auto',
						keyMode: 'numbers',
						partialScoringLabel: '',
						shuffle: false,
						allowFeedback: false,
						feedbackEnabled: false,
						promptEnabled: true,
						rationaleEnabled: false,
						teacherInstructionsEnabled: false,
						studentInstructionsEnabled: false
					}
				}
			],
			markup: '<pie-element-ebsr id="p-00000000"></pie-element-ebsr>'
		}
	},
	inline_dropdown: {
		configSettings: {
			'@pie-element/inline-dropdown': {
				prompt: {
					settings: true,
					label: 'Item Stem'
				},
				lockChoiceOrder: {
					settings: true,
					label: 'Lock Choice Order'
				},
				partialScoring: {
					settings: false,
					label: 'Allow Partial Scoring'
				},
				teacherInstructions: {
					settings: true,
					label: 'Teacher Instructions'
				}
			}
		},
		contentConfig: {
			id: 'p-00000000',
			elements: {
				'pie-inline-dropdown': '@pie-element/inline-dropdown@latest'
			},
			models: [
				{
					id: 'p-00000000',
					element: 'pie-inline-dropdown',
					disabled: false,
					mode: 'gather',
					prompt: '<div></div>',
					shuffle: true,
					choices: {},
					slateMarkup: '<div></div>',
					lockChoiceOrder: false,
					promptEnabled: true,
					rationaleEnabled: false,
					teacherInstructionsEnabled: false,
					studentInstructionsEnabled: false
				}
			],
			markup:
				'<pie-inline-dropdown id="p-00000000"></pie-inline-dropdown>'
		}
	},
	hot_text: {
		configSettings: {
			'@pie-element/select-text': {
				selectionCount: {
					settings: false,
					label: 'Selection Count'
				},
				correctAnswer: {
					settings: false,
					label: 'Correct Answers'
				},
				selections: {
					settings: false,
					label: 'Selections Available'
				},
				highlightChoices: {
					settings: true,
					label: 'Highlight Choices'
				},
				rationale: {
					settings: true,
					label: 'Rationale'
				},
				scoringType: {
					settings: false,
					label: 'Scoring Type'
				},
				studentInstructions: {
					settings: false,
					label: 'Student Instructions'
				},
				teacherInstructions: {
					settings: true,
					label: 'Teacher Instructions'
				},
				prompt: {
					label: 'Item Stem'
				},
				text: {
					settings: true,
					label: 'Enter Content'
				},
				tokens: {
					settings: true,
					label: 'Tokens'
				},
				feedback: {
					settings: false,
					label: 'Student Feedback'
				},
				partialScoring: {
					settings: false,
					label: 'Allow Partial Scoring'
				},
				mode: {
					settings: false,
					label: 'Mode'
				}
			}
		},
		contentConfig: {
			id: 'p-00000000',
			elements: {
				'pie-select-text': '@pie-element/select-text@latest'
			},
			models: [
				{
					id: 'p-00000000',
					element: 'pie-select-text',
					highlightChoices: true,
					partialScoring: false,
					maxSelections: 2,
					mode: 'sentence',
					prompt: '<div></div>',
					text: '',
					tokens: [],
					scoringType: 'auto',
					feedback: {
						correct: {
							type: 'default',
							default: 'Correct'
						},
						incorrect: {
							type: 'default',
							default: 'Incorrect'
						},
						partial: {
							type: 'default',
							default: 'Nearly'
						}
					},
					feedbackEnabled: false,
					rationaleEnabled: false,
					promptEnabled: true,
					teacherInstructionsEnabled: false,
					studentInstructionsEnabled: false
				}
			],
			markup: '<pie-select-text id="p-00000000"></pie-select-text>'
		}
	},
	hot_spot: {
		configSettings: {
			'@pie-element/hotspot': {
				multipleCorrect: {
					settings: true,
					label: 'Multiple Correct Responses',
					enabled: false
				},
				partialScoring: {
					settings: false,
					label: 'Allow Partial Scoring'
				},
				rationale: {
					settings: true,
					label: 'Rationale'
				},
				teacherInstructions: {
					settings: true,
					label: 'Teacher Instructions'
				},
				prompt: {
					settings: true,
					label: 'Prompt',
					enabled: true
				}
			}
		},
		contentConfig: {
			id: 'p-00000000',
			elements: {
				'pie-hotspot': '@pie-element/hotspot@latest'
			},
			models: [
				{
					id: 'p-00000000',
					element: 'pie-hotspot',
					prompt: '',
					imageUrl: '',
					shapes: {
						rectangles: [],
						polygons: []
					},
					multipleCorrect: false,
					partialScoring: false,
					dimensions: {
						height: 0,
						width: 0
					},
					hotspotColor: 'rgba(137, 183, 244, 0.65)',
					hotspotList: [
						'rgba(137, 183, 244, 0.65)',
						'rgba(217, 30, 24, 0.65)',
						'rgba(254, 241, 96, 0.65)'
					],
					outlineColor: 'blue',
					outlineList: ['blue', 'red', 'yellow'],
					rationaleEnabled: false,
					teacherInstructionsEnabled: false,
					studentInstructionsEnabled: false
				}
			],
			markup: '<pie-hotspot id="p-00000000"></pie-hotspot>'
		}
	},
	drag_in_the_blank: {
		configSettings: {
			'@pie-element/drag-in-the-blank': {
				prompt: {
					settings: true,
					label: 'Item Stem'
				},
				duplicates: {
					settings: true,
					label: 'Allow Duplicates'
				},
				lockChoiceOrder: {
					settings: true,
					label: 'Lock Choice Order'
				},
				partialScoring: {
					settings: false,
					label: 'Allow Partial Scoring'
				},
				rationale: {
					settings: true,
					label: 'Rationale'
				},
				studentInstructions: {
					settings: false,
					label: 'Student Instructions'
				},
				teacherInstructions: {
					settings: true,
					label: 'Teacher Instructions'
				}
			}
		},
		contentConfig: {
			id: 'p-00000000',
			elements: {
				'pie-drag-in-the-blank': '@pie-element/drag-in-the-blank@latest'
			},
			models: [
				{
					id: 'p-00000000',
					element: 'pie-drag-in-the-blank',
					disabled: false,
					mode: 'gather',
					shuffle: true,
					prompt: '<div></div>',
					choices: [],
					choicesPosition: 'below',
					correctResponse: {},
					duplicates: false,
					partialScoring: false,
					slateMarkup: '<div></div>',
					rationaleEnabled: false,
					promptEnabled: true,
					teacherInstructionsEnabled: false,
					studentInstructionsEnabled: false
				}
			],
			markup:
				'<pie-drag-in-the-blank id="p-00000000"></pie-drag-in-the-blank>'
		}
	}
};

const ibxItemTypes = [
	{
		name: 'Multiple Choice',
		id: 'multiple_choice',
		symbol: 'Multiple Choice_1'
	},
	{
		name: 'Multiple Select',
		id: 'multiple_select',
		symbol: 'Multiple Choice_1'
	},
	{
		name: 'Constructed Response',
		id: 'constructed_response',
		symbol: 'Constructed Response_1'
	},
	{
		name: 'Explicit Constructed Response',
		id: 'explicit_constructed_response',
		symbol: 'Constructed Response_1'
	},
	{
		name: 'Math Equation Response',
		id: 'math_equation_response',
		symbol: 'Math Equation Response_1'
	},
	{
		name: 'EBSR',
		id: 'evidence_based_selected_response',
		symbol: 'Evidence-Based Selected Response_1'
	},
	{
		name: 'Inline Dropdown',
		id: 'inline_dropdown',
		symbol: 'Inline Dropdown_1'
	},
	{
		name: 'Hot Text',
		id: 'hot_text',
		symbol: 'Hot Text_1'
	},
	{
		name: 'Hot Spot',
		id: 'hot_spot',
		symbol: 'Hot Spot_1'
	},
	{
		name: 'Drag in the Blank',
		id: 'drag_in_the_blank',
		symbol: 'Drag and Drop_1'
	}
];

export { authorSettings, ibxItemTypes };

import { AdvancedItemConfig, PieContent } from "../../interface";

export const simplePieMock: PieContent = {
  id: "1",
  elements: {"pie-multiple-choice": "@pie-element/multiple-choice@2.4.6"},
  models: [
    {
      id: "1",
      element: "pie-multiple-choice"
    }],
  markup: "<pie-multiple-choice id='1'></pie-multiple-choice>"
}


export const advancedPieMock: AdvancedItemConfig = {
  id: "1",
  pie: simplePieMock,
  passage: {
    id: "1",
    elements: {"pie-passage": "@pie-element/passage@latest"},
    models: [
      {
        id: "1",
        element: "pie-passage",
        title: "passage title",
        content: "passage content"
      }],
    markup: "<pie-passage id='1'></pie-passage"
  }
}

export const multipleChoiceItem = {
  id: '1',
  elements: { 'pie-multiple-choice': '@pie-element/multiple-choice@2.4.6' },
  models: [
    {
      id: '1',
      element: 'pie-multiple-choice'
    }
  ],
  markup: "<pie-multiple-choice id='1'></pie-multiple-choice>"
};

export const inlineChoiceItem = {
  id: '1',
  elements: { 'pie-inline-choice': '@pie-element/inline-choice@latest' },
  models: [
    {
      id: '1',
      element: 'pie-inline-choice'
    }
  ],
  markup: "<pie-inline-choice id='1'></pie-inline-choice>"
};

export const multiPartItemWithPassage = {
  id: '1',
  elements: { 'pie-inline-choice': '@pie-element/inline-choice@latest',
  'pie-multiple-choice': '@pie-element/multiple-choice@2.4.6',
  "pie-passage": "@pie-element/passage@latest"},
  models: [
    {
      id: '1',
      element: 'pie-inline-choice'
    },
    {
      id: "2",
      element: "pie-passage",
      title: "passage title",
      content: "passage content"
    }
    ,
    {
      id: '3',
      element: 'pie-multiple-choice'
    }
  ],
  markup: "<pie-inline-choice id='1'></pie-inline-choice> <pie-passage id='3'></pie-passage> <pie-multiple-choice id='3'></pie-multiple-choice>"
};


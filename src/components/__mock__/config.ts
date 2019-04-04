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
  pie: simplePieMock
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
  elements: { 'pie-inline-choice': '@pie-element/pie-inline-choice@latest' },
  models: [
    {
      id: '1',
      element: 'pie-inline-choice'
    }
  ],
  markup: "<pie-inline-choice id='1'></pie-inline-choice>"
};

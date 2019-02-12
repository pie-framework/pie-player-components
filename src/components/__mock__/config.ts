import { AdvancedItemConfig, PieContent } from "../../interface";

export const simplePieMock: PieContent = {
  id: "1",
  elements: {"pie-multiple-choice": "@pie-element/multiple-choice@2.4.6"},
  models: [
    { 
      id: "a",
      element: "pie-multiple-choice"
    }],
  markup: "<pie-multiple-choice id='1'></pie-multiple-choice>"
}

export const advancedPieMock: AdvancedItemConfig = {
  id: "1",
  pie: simplePieMock
}

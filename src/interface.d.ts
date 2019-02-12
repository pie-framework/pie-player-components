
interface PieContent {
  id: string;
  /**
   * Set of elements to include in the pie, provided in the format `{'element-name': 'mpm-package-name'}`
   */
  elements: PieItemElement;

  /** Models for each PIE included in the item */
  models: [PieModel]

  markup: string;
}


export interface PieItemElement { 
  [elementName: string]: string 
}

interface AdvancedItemConfig {
  id: string;
  pie: PieContent;
  stimulus?: PieContent;
  instructorResources?: [PieContent];
}

interface PieModel  {
  /** Identifier to identify the Pie Element in html markup, Must be unique within a pie item config. */
  id: string,
  /** The html Element tag name */
  element: string;
}


export type ItemConfig = PieContent | AdvancedItemConfig;


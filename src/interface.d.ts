
interface PieContent {
  id: string;
  /**
   * Set of elements to include in the pie, provided in the format `{'element-name': 'mpm-package-name'}`
   * @deprecated
   */
  elements: PieItemElement;

  /**
   * Definitions for the PIEs included in the content
   */
  pies?: PieDefinitions,

  /** Models for each PIE included in the content */
  models: PieModel[]

  markup?: string;

  /**
   * The js bundle to load to render the content
   * @deprecated
   */
  bundle?: BundleInfo;
}

export interface PieDefinitions { 
  [pieKey: string]: PieDef 
}

export type PieDef = {
  modules?: PieModulesDef;
  name?: string;
  type?: PieType;
  tag?: string;
}

export enum PieType {
  interaction = 'ineraction',
  stimulus = 'stimulus',
  calculator = 'calculator'
}


export type PieModulesDef = {
  config?: string;
  controller?: string;
  render: string;
}

export type BundleInfo = {
  url: string;
  hash: string;
};

export type ItemSession = {
  id: string;
  data: any[];
};

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
  /** 
   * The pie 'element' tag, to pair this model with a pie in `markup` 
   */
  element: string;
  // supports 'excess' properties as may be defined in pie models
  // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#strict-object-literal-assignment-checking
  [x: string]: any;
}


export type ItemConfig = PieContent | AdvancedItemConfig;


interface PieElement extends HTMLElement {
  _model: Object,
  model: Object;
  configuration: Object,
  _configure: Object,
  session: Object;
  onModelChanged: Function;
}


type PieController = {
  model: (config: Object, session: Object, env: Object) => Promise<Object>;
  score: (config: Object, session: Object, env: Object) => Promise<Object>;
  createCorrectResponseSession: (config: Object, env: Object) => Promise<Object>;  
};


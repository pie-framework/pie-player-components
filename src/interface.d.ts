
interface PieContent {
  id: string;
  /**
   * Set of elements to include in the pie, provided in the format `{'element-name': 'mpm-package-name'}`
   */
  elements: PieItemElement;

  /** Models for each PIE included in the item */
  models: PieModel[]

  markup: string;

  bundle?: BundleInfo;

  defaultExtraModels?: {
    [key: string]: PieDefaultModel
  };

  resources?: ConfigResource;
}

interface ConfigResource {
  stylesheets?: {
    url: string;
  }[];
  containerClass?: string;
  passageContainerClass?: string;
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
  passage?: PieContent;
  instructorResources?: [PieContent];
  defaultExtraModels?: {
    [key: string]: PieDefaultModel
  };
}

interface PieModel  {
  /** Identifier to identify the Pie Element in html markup, Must be unique within a pie item config. */
  id: string,
  /** The html Element tag name */
  element: string;
  // supports 'excess' properties as may be defined in pie models
  // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#strict-object-literal-assignment-checking
  [x: string]: any;
}

interface PieDefaultModel  {
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
  outcome: (config: Object, session: Object, env: Object) => Promise<Object>;
  model: (config: Object, session: Object, env: Object) => Promise<Object>;
  score: (config: Object, session: Object, env: Object) => Promise<Object>;
  createCorrectResponseSession: (config: Object, env: Object) => Promise<Object>;
  validate: (model: Object, config: Object) => any;
};

export enum Mode {
  view = "view",
  gather = "gather",
  evaluate = "evaluate",
}

export enum Role {
  student = "student",
  instructor = "instructor",
}

export type Env = {
  mode: Mode | String;
  role: Role | String;
  partialScoring?: boolean;
};

import { PieLoader } from "../pie-loader";


export class MockPieLoader extends PieLoader {
  constructor() {
    super();
  }
  public _getElementsToLoad() {
    return this.getElementsToLoad;
  } 
  public _registry() {
    return this.registry;
  }
}

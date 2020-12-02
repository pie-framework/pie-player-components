import { PieContent, PieController } from "../interface";
import {
  LoadedElementsQuery,
  LoadedElementsResp,
  LoadOpts,
  PieLoader,
} from "../loader/pie-loader";

export class MockPieLoader implements PieLoader {
  getController(name: string): PieController {
    throw new Error("Method not implemented.");
  }
  elementsHaveLoaded(
    elements: LoadedElementsQuery[]
  ): Promise<LoadedElementsResp> {
    throw new Error("Method not implemented.");
  }
  load(content: PieContent, opts: LoadOpts): Promise<void> {
    throw new Error("Method not implemented.");
  }
  // constructor() {
  //   super();
  // }
  // public _getElementsToLoad() {
  //   return this.getElementsToLoad;
  // }
  // public _registry() {
  //   return this.registry;
  // }
}

import { PieLoader,Status } from "../pie-loader";
import { PieItemElement } from '../interface';
import { MockPieLoader } from "./mockPieLoader";


describe('hande registry  packages', () => {

  const loader = new MockPieLoader();
  loader._registry()['multiple-choice'] =  {
    package: "@pie-elements/multiple-choice@1.0.0",
    status: Status.loaded,
    tagName: "multiple-choice"
  }
  loader._registry()['inline-choice'] =  {
    package: "@pie-elements/inline-choice@1.0.0",
    status: Status.loaded,
    tagName: "inline-choice"
  }


  const els:PieItemElement = {
    "multiple-choice": "@pie-elements/multiple-choice@1.0.0",
    "inline-choice": "@pie-elements/inline-choice@1.0.0",
    "math-inline": "@pie-elements/math-inline@1.0.0"
  };

  
  it('only adds packages that are not in the registry', () => {  
    const result = loader._getElementsToLoad()(els);
    expect(result).toBeDefined();
    expect(result['math-inline']).toBeDefined();
  });

  it('creates bundle retreival url', () => {  
    const result = loader._getElementsToLoad()(els);
    expect(result).toBeDefined();
    expect(result['math-inline']).toBeDefined();
  });



});

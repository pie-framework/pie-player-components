import { PieLoader,Status, BundleType, Entry } from "../pie-loader";
import { PieItemElement } from '../interface';
import { MockPieLoader } from "./mockPieLoader";


describe('hande registry  packages', () => {

  const loader = new MockPieLoader();


  const registry = {};

  registry['multiple-choice'] = {
    package: "@pie-elements/multiple-choice@1.0.0",
    status: Status.loaded,
    tagName: "multiple-choice"
  };
  registry['inline-choice'] = {
    package: "@pie-elements/inline-choice@1.0.0",
    status: Status.loaded,
    tagName: "inline-choice"
  };

  const els:PieItemElement = {
    "multiple-choice": "@pie-elements/multiple-choice@1.0.0",
    "inline-choice": "@pie-elements/inline-choice@1.0.0",
    "math-inline": "@pie-elements/math-inline@1.0.0"
  };

  const withBundle = (bundle, registry) =>{
    const constructors = {
      player: {element: {}, config: null, controller: null},
      editor: {element: {}, config: {}, controller: {}},
      clientPlayer: {element: {}, config: null, controller: {}}
    }
    const newReg = {};
    
    
    Object.keys(registry).forEach((key) => {
      newReg[key] = {...registry[key], ...constructors[bundle]};
    })
    return newReg;
  }
  
  it('only adds packages that are not in the registry', () => {  
    const result = loader._getElementsToLoad()(els, BundleType.player, withBundle('player', registry));
    expect(result).toBeDefined();
    expect(Object.keys(result).length).toEqual(1);
    expect(result['math-inline']).toBeDefined();

    const result2 = loader._getElementsToLoad()(els, BundleType.player, withBundle('editor', registry));
    expect(result).toBeDefined();
    expect(Object.keys(result2).length).toEqual(1);
    expect(result2['math-inline']).toBeDefined();

  });

  it('add packages if registry entry is missing needed constructor', () => {  
    const result = loader._getElementsToLoad()(els, BundleType.editor, withBundle('player', registry));
    expect(result).toBeDefined();
    expect(Object.keys(result).length).toEqual(3);
    expect(result['math-inline']).toBeDefined();

    const result2 = loader._getElementsToLoad()(els, BundleType.editor, withBundle('clientPlayer', registry));
    expect(result2).toBeDefined();
    expect(Object.keys(result2).length).toEqual(3);
    expect(result2['math-inline']).toBeDefined();

  });


});

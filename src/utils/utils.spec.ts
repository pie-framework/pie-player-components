import { getPackageWithoutVersion, getPackageBundleUri, elementsHasPackage, modelsForPackage, elementForPackage } from './utils';
import { PieContent } from '../interface';

describe('package utils', () => {
  it('removes version from package names', () => {
    expect(getPackageWithoutVersion("@pie-elements/multiple-choice@1.2.2")).toEqual('@pie-elements/multiple-choice');
    expect(getPackageWithoutVersion("@pie-elements/multiple-choice@latest")).toEqual('@pie-elements/multiple-choice');
    expect(getPackageWithoutVersion("multiple-choice@1.2.2")).toEqual('multiple-choice');
  });

  it('gets URI for pacakges', () => {
    const els = {
      "multiple-choice": "@pie-elements/multiple-choice@1.0.0",
      "inline-choice": "@pie-elements/inline-choice@1.0.0",
      "math-inline": "@pie-elements/math-inline@1.0.0"
    };
    const result = getPackageBundleUri(els);
    expect(result).toEqual('@pie-elements/multiple-choice@1.0.0+@pie-elements/inline-choice@1.0.0+@pie-elements/math-inline@1.0.0');
  });;

  it('check for package in PieContent.Elements', () => {
    const els = {
      "multiple-choice": "@pie-elements/multiple-choice@1.0.0",
      "inline-choice": "@pie-elements/inline-choice@1.0.0",
      "math-inline": "@pie-elements/math-inline@1.0.0"
    };
    const mc = elementsHasPackage(els, '@pie-elements/multiple-choice');
    expect(mc).toBeTruthy();
    const ic = elementsHasPackage(els, '@pie-elements/inline-choice@1.0.0');
    expect(ic).toBeTruthy();
  });


  it('throws if same tag used for a package', () => {
    const els = {
      "multiple-choice": "@pie-elements/multiple-choice@1.0.0",
      "some-el": "@pie-elements/multiple-choice@1.0.0",
      "math-inline": "@pie-elements/math-inline@1.0.0"
    };
    expect(() => {
      elementForPackage(({elements: els} as any), '@pie-elements/multiple-choice');
    }).toThrow();
  });

  it('find models for a package in PieContent.Elements', () => {
    const content: PieContent = {
      id: '1',
      elements: {
        'pie-el': '@pie-element/some-el@latest'
      },
      models: [
        {
          id: 'x',
          element: 'pie-el'
        },
        {
          id: 'y',
          element: 'pie-el'
        }
      ],
      markup: ''
    };

    const noVersion = modelsForPackage(content, '@pie-element/some-el');
    expect(noVersion).toBeDefined();
    expect(noVersion.length).toEqual(2);
  });


});

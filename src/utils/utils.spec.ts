import { getPackageWithoutVersion, getPackageBundleUri, elementsHasPackage, modelsForPackage, elementForPackage, packageToElementName, normalizeContentElements } from './utils';
import { PieContent } from '../interface';

describe('package utils', () => {

  it('converts npm package to element name', () => {
    expect(packageToElementName("@pie-elements/multiple-choice@1.2.2")).toEqual('pie-elements-multiple-choice');
    expect(packageToElementName("multiple-choice@1.2.2")).toEqual('multiple-choice');
    expect(packageToElementName("foo")).toEqual('foo');
  });


  it('normalizes content tlement names with package-based element names', () => {
    const mockContent = {
      id: "",
      elements: {
        "el-foo": "foo-package",
        "el-bar": "@bar-scope/bar-package@1.0.0",
        "el-baz": "baz"
      },
      models: [{id: "1", element:"el-foo"}],
      markup: '<el-foo></el-foo> <el-bar></el-bar> <el-baz></el-baz>'
    }
    const normalized = normalizeContentElements(mockContent);
    expect(normalized.markup).toEqual('<pp-foo-package></pp-foo-package> <pp-bar-scope-bar-package></pp-bar-scope-bar-package> <pp-baz></pp-baz>');
    expect(normalized.models).toEqual([{id:"1", element:"pp-foo-package"}]);
    expect(normalized.elements['pp-foo-package']).toEqual("foo-package");
    expect(normalized.elements["el-foo"]).toBeUndefined();

  });



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

import { getPackageWithoutVersion, getPackageBundleUri } from './utils';

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

});

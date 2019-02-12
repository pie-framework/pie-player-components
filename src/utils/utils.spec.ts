import { getPackageWithoutVersion } from './utils';

describe('remove package version', () => {
  it('removes version from package names', () => {
    expect(getPackageWithoutVersion("@pie-elements/multiple-choice@1.2.2")).toEqual('@pie-elements/multiple-choice');
    expect(getPackageWithoutVersion("@pie-elements/multiple-choice@latest")).toEqual('@pie-elements/multiple-choice');
    expect(getPackageWithoutVersion("multiple-choice@1.2.2")).toEqual('multiple-choice');
  });

});

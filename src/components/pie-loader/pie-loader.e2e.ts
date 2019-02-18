import { setupInterceptForRetry } from '../__tests__/util';
import { newE2EPage, E2EElement, E2EPage } from '@stencil/core/testing';
import { PieItemElement } from '../../interface';


describe('pie-loader', () => {
  let page: E2EPage;
  let pieLoader: E2EElement;

  const els: PieItemElement = {
    'multiple-choice': '@pie-element/multiple-choice@1.0.0',
    'inline-choice': '@pie-element/inline-choice@1.0.0',
    'math-inline': '@pie-element/math-inline@1.0.0'
  };

  beforeEach(async () => {
    page = await newE2EPage();
    // TODO - figure out how supress expected browser console errors, the below doesn't work
    // (page as any).removeListener('error', (message) => {
    //   ...
    // });
  });

  it('retries the JS url', async () => {
    await page.setContent(
      '<pie-loader retries="5" min-timeout="100" max-timeout="200"></pie-loader>'
    );
    pieLoader = await page.find('pie-loader');

    await setupInterceptForRetry(page);

    await pieLoader.callMethod('loadPies', els);
    await page.waitForChanges();
  });

  xit('handles a 404 for bundle url', () => {});
});

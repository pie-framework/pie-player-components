import { setupInterceptForRetry } from "../__tests__/util";
import { newE2EPage, E2EElement, E2EPage } from '@stencil/core/testing';
import { PieItemElement } from "../../interface";
import { BUILD_SERVICE_BASE } from "../../defaults";



describe('pie-loader', () => {
  let page: E2EPage; 
  let pieLoader: E2EElement; 

  const els:PieItemElement = {
    "multiple-choice": "@pie-elements/multiple-choice@1.0.0",
    "inline-choice": "@pie-elements/inline-choice@1.0.0",
    "math-inline": "@pie-elements/math-inline@1.0.0"
  };

  beforeEach(async () => {
    page = await newE2EPage();
  });

  it('retries the JS url', async () => {
    console.log(` (teat) running`);
    await page.setContent('<pie-loader></pie-loader>');
    pieLoader = await page.find('pie-loader');

    await setupInterceptForRetry(page);

    page.on('requestfailed', () => {
      console.log(`(page - requwest failed`);
    });
    await pieLoader.callMethod('loadPies', els);
    await page.waitForChanges();
  });

});
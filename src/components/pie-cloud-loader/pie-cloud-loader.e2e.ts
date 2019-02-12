import { newE2EPage, E2EPage, E2EElement } from '@stencil/core/testing';
import { simplePieMock } from '../__mock__/config';

const fs = require('fs');

const mockPieCloudResponseContent = fs.readFileSync(
  __dirname + '/__tests__/mockPieCloudResponse.js'
);

const setupInterceptPieCloud = (page, match): Promise<void> => {
  page.on('request', request => {
    console.log(`----- intercept called, url = ${request.url()}  match = ${match}`);
    // mock the response from pie cloud
    if (request.url().match(match)) {
      console.log(`----- returning mock`);
      request.respond({
        status: 200,
        contentType: 'application/javascript',
        body: mockPieCloudResponseContent
      });
    } else {
      request.continue();
    }
  });
  return page.setRequestInterception(true);
};

describe('pie-cload-loader', () => {
  let page: E2EPage, pieCloudLoader: E2EElement;
  const pie = '@pie-element/multiple-choice';
  beforeEach(async () => {
    page = await newE2EPage();
    await page.setContent('<pie-cloud-loader></pie-cloud-loader>');
    pieCloudLoader = await page.find('pie-cloud-loader');
  });

  it('renders', async () => {
    expect(pieCloudLoader).toHaveClass('hydrated');
  });

  it('loads the script and registers', async () => {
    await setupInterceptPieCloud(page, pie);
    console.log(`-- calling createAuthor  from tests`);
    await pieCloudLoader.callMethod('createAuthor', { config: simplePieMock });
    await page.waitForChanges();
    const pieElement = await page.waitForSelector('pie-cloud-loader pie-author');
    expect(pieElement).toBeDefined();
    const pieScript = await page.find('script#multiple-choice');
    expect(pieScript).toBeDefined();
  });
});

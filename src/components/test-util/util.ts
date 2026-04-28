import { E2EPage } from '@stencil/core/testing';

const fs = require('fs');

const mockPieCloudResponseContent = fs.readFileSync(
  __dirname + '/mockPieCloudResponse.js',
);
const resHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With',
};

export const setupInterceptPieCloud = async (page: E2EPage, match): Promise<void> => {
  // Remove existing request listeners (e.g. from Stencil's setContent) since
  // Puppeteer v20 only allows one handler to resolve each request. After
  // setContent completes the Stencil app is already loaded, so we can safely
  // replace Stencil's handler with our own unified handler.
  (page as any).removeAllListeners('request');

  page.on('request', request => {
    if ((request as any).isInterceptResolutionHandled && (request as any).isInterceptResolutionHandled()) {
      return;
    }
    // mock the response from pie cloud
    if (request.url().match(match)) {
      try {
        request.respond({
          status: 200,
          headers: resHeaders,
          contentType: 'application/javascript',
          body: mockPieCloudResponseContent,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        request.continue();
      } catch (err) {
        // request may already be handled
      }
    }
  });

  // setRequestInterception may already be enabled by Stencil's setContent;
  // calling it again is idempotent.
  return await page.setRequestInterception(true);
};

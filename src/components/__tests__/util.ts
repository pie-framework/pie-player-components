import { BUILD_SERVICE_BASE } from "../../defaults";
import { E2EPage } from "@stencil/core/dist/testing";

const fs = require('fs');

const mockPieCloudResponseContent = fs.readFileSync(
  __dirname + '/mockPieCloudResponse.js'
);

export const setupInterceptPieCloud = (page, match): Promise<void> => {
  page.on('request', request => {
    // mock the response from pie cloud
    if (request.url().match(match)) {
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

export const setupInterceptForRetry = (page: E2EPage, numberOfFailures = 4): Promise<void> => {
  const resHeaders = {"Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"
};
  const successResponse = {
    status: 200,
    contentType: 'application/javascript',
    headers: resHeaders,
    body: mockPieCloudResponseContent
  }
  const failResponse = {
    headers: resHeaders,
    status: 503
  }
  console.log(`setting  up intercept`);

  let count = 0;
  page.on('request', request => {
    count++;
    
    console.log(`[setupInterceptForRetry] ${count} request received ${request.url()}`);
    // mock the response from pie cloud
    console.log(`[setupInterceptForRetry] headers ${JSON.stringify(request.headers())}`);
    if (request.url().match(BUILD_SERVICE_BASE)) {
      console.log(`[setupInterceptForRetry] send 503 response for ${request.url()}`);
      if (count <= numberOfFailures) {
        request.respond(failResponse);
      } else {
        request.respond(successResponse);
      }
      
    } 

  });
  return page.setRequestInterception(true);
};


import { BUILD_SERVICE_BASE } from "../../defaults";
import { E2EPage } from "@stencil/core/dist/testing";

const fs = require('fs');

const mockPieCloudResponseContent = fs.readFileSync(
  __dirname + '/mockPieCloudResponse.js'
);
const resHeaders = {"Access-Control-Allow-Origin": "*", 
"Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
"Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"
};

export const setupInterceptPieCloud = async (page:E2EPage, match): Promise<void> => {
  
  
  page.on('request', request => {
    // mock the response from pie cloud
    if (request.url().match(match)) {
      try {
       request.respond({
          status: 200,
          headers: resHeaders,
          contentType: 'application/javascript',
          body: mockPieCloudResponseContent
        });
      } catch(err) {
        console.error(err);
        
      }
    } else {
      request.continue();
    }
  });
  return await page.setRequestInterception(true);;
};

export const setupInterceptForRetry = (page: E2EPage, numberOfFailures = 4): Promise<void> => {

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

  let count = 0;
  page.on('request', request => {
    count++;
    ;
    if (request.url().match(BUILD_SERVICE_BASE)) {
      // fail the pre-flights
      if (count <= numberOfFailures && request.method() === "OPTIONS") {
        request.respond(failResponse);
      } else {
        request.respond(successResponse);
      }
      
    } 

  });
  return page.setRequestInterception(true);
};


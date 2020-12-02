import { E2EPage } from "@stencil/core/testing";

const fs = require("fs");

const mockPieCloudResponseContent = fs.readFileSync(
  __dirname + "/mockPieCloudResponse.js"
);

const resHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
};

export const setupInterceptPieCloud = async (
  page: E2EPage,
  match
): Promise<void> => {
  page.on("request", (request) => {
    // mock the response from pie cloud
    if (request.url().match(match)) {
      try {
        console.log("RESPOND!", match);
        request.respond({
          status: 200,
          headers: resHeaders,
          contentType: "application/javascript",
          body: mockPieCloudResponseContent,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      request.continue();
    }
  });
  return await page.setRequestInterception(true);
};

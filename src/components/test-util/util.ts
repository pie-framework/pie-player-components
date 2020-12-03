import { E2EPage } from "@stencil/core/testing";

const fs = require("fs");

export const mockPieCloudResponseContent = fs.readFileSync(
  __dirname + "/mockPieCloudResponse.js"
);

export const resHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
};

export const setupInterceptPieCloud = async (
  page: E2EPage,
  match
): Promise<void> => {
  page.on("request", async (request) => {
    if (request.url().match(match)) {
      try {
        // console.log(
        //   "RESPOND!",
        //   request.url(),
        //   match,
        //   "handled?",
        //   (request as any)._interceptionHandled
        // );
        await request.respond({
          status: 200,
          headers: resHeaders,
          contentType: "application/javascript",
          body: mockPieCloudResponseContent,
        });
      } catch (err) {
        console.error(err);
        await request.abort();
      }
    } else {
      request.continue();
    }
  });
  await page.setRequestInterception(true);
};

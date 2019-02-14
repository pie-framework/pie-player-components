const fs = require('fs');

const mockPieCloudResponseContent = fs.readFileSync(
  __dirname + '/mockPieCloudResponse.js'
);

export const setupInterceptPieCloud = (page, match): Promise<void> => {
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

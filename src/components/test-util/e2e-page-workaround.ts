import { newE2EPage as stencil_newE2EPage } from "@stencil/core/testing";
import {
  E2EPage,
  NewE2EPageOptions,
} from "@stencil/core/testing/puppeteer/puppeteer-declarations";
import { NavigationOptions } from "puppeteer";

export const newE2EPage = async (opts?: NewE2EPageOptions) => {
  const page = await stencil_newE2EPage(opts);

  (page as any).setContent = () => {
    throw new Error("use setContent below!");
  };
  return page;
};

/**
 * Workaround for:
 * @see https://github.com/ionic-team/stencil/issues/1567
 *
 * This is hopefully temporary - lifted from stencil src.
 * @param opts
 */
export const setContent = async (
  page: E2EPage,
  html: string,
  options: NavigationOptions = {}
) => {
  if (typeof html !== "string") {
    throw new Error("invalid e2eSetContent() html");
  }

  const output: string[] = [];

  const appScriptUrl = process.env.__STENCIL_APP_SCRIPT_URL__;
  if (typeof appScriptUrl !== "string") {
    throw new Error("invalid e2eSetContent() app script url");
  }

  output.push(`<!doctype html>`);
  output.push(`<html>`);
  output.push(`<head>`);

  const appStyleUrl = process.env.__STENCIL_APP_STYLE_URL__;
  if (typeof appStyleUrl === "string") {
    output.push(`<link rel="stylesheet" href="${appStyleUrl}">`);
  }
  output.push(`<script type="module" src="${appScriptUrl}"></script>`);

  output.push(`</head>`);
  output.push(`<body>`);
  output.push(html);
  output.push(`</body>`);
  output.push(`</html>`);

  const pageUrl = process.env.__STENCIL_BROWSER_URL__;

  await page.setRequestInterception(true);

  const interceptedReqCallback = (interceptedRequest: any) => {
    if (pageUrl === interceptedRequest.url()) {
      interceptedRequest.respond({
        status: 200,
        contentType: "text/html",
        body: output.join("\n"),
      });
      // console.log("NOW REMOVE ALL LISTENERS!!!!");
      (page as any).removeAllListeners("request");
      page.setRequestInterception(false);
    } else {
      interceptedRequest.continue();
    }
  };

  page.on("request", interceptedReqCallback);

  if (!options.waitUntil) {
    options.waitUntil = process.env.__STENCIL_BROWSER_WAIT_UNTIL as any;
  }
  // console.log("PAGE URL:", pageUrl);

  const rsp = await page.goto("/", options);

  if (!rsp.ok()) {
    throw new Error(`Testing unable to load content`);
  }

  // await waitForStencil(page, options);

  return rsp;
  // }
};

import { newE2EPage, E2EElement, E2EPage } from "@stencil/core/testing";
import { setupInterceptPieCloud } from "../../test-util/util";
import {
  simplePieMock,
  multipleChoiceItem,
  inlineChoiceItem,
  multiPartItemWithPassage,
} from "../../__mock__/config";
import cloneDeep from "lodash/cloneDeep";

describe("pie-author", () => {
  let pie;
  let page: E2EPage, pieAuthor: E2EElement;
  let pieMock;
  beforeEach(async () => {
    pie = "@pie-element/multiple-choice";
    page = await newE2EPage();
    pieMock = cloneDeep(simplePieMock);
  });

  // it.only("renders", async () => {
  //   await page.setContent('<pie-author config="evan"></pie-author>');
  //   const element = await page.find("pie-author");
  //   expect(element).toHaveClass("hydrated");
  // });

  it("loads the PIE Content and packages ", async () => {
    await page.setContent('<pie-author config="evan"></pie-author>');
    expect(true).toEqual(true);
    pieAuthor = await page.find("pie-author");
    await setupInterceptPieCloud(page, pie);
    pieAuthor.setProperty("config", pieMock);
    await page.waitForChanges();
    const el = await page.waitForSelector("pie-author");
    expect(el).toBeDefined();
    // const pieScript = await page.find("script#multiple-choice");
    // expect(pieScript).toBeDefined();
  });

  // it("gets modelLoaded event", async () => {
  //   await page.setContent('<pie-author config="evan"></pie-author>');
  //   pieAuthor = await page.find("pie-author");
  //   await setupInterceptPieCloud(page, pie);

  //   const spy = await page.spyOnEvent("modelLoaded");
  //   const modelUpdatedSpy = await page.spyOnEvent("modelUpdated");
  //   pieAuthor.setProperty("config", multiPartItemWithPassage);
  //   await page.waitForChanges();
  //   expect(spy).toHaveReceivedEventTimes(1);
  //   expect(modelUpdatedSpy).toHaveReceivedEventTimes(0);
  // });

  // it("creates new models if models is empty ", async () => {
  //   await page.setContent("<pie-author></pie-author>");
  //   pieAuthor = await page.find("pie-author");
  //   await setupInterceptPieCloud(page, pie);
  //   const emptyItem = pieMock;
  //   emptyItem.models = null;
  //   await page.$eval(
  //     "pie-author",
  //     (elm: any, prop) => {
  //       elm.config = prop;
  //     },
  //     emptyItem
  //   );

  //   await page.waitForChanges();
  //   const configEl = await page.find(
  //     "pie-author pp-pie-element-multiple-choice-config"
  //   );
  //   const model = await configEl.getProperty("model");
  //   expect(model.id).toEqual("1");
  // });

  // it("doesn't maintain stale data when  prop updates", async () => {
  //   await page.setContent("<pie-author></pie-author>");
  //   pieAuthor = await page.find("pie-author");
  //   await setupInterceptPieCloud(page, pie);
  //   const item = pieMock;
  //   const copy = cloneDeep(pieMock);
  //   item.models[0].test = "test";

  //   await page.$eval(
  //     "pie-author",
  //     (elm: any, prop) => {
  //       elm.config = prop;
  //     },
  //     item
  //   );

  //   await page.waitForChanges();
  //   const configEl = await page.find(
  //     "pie-author pp-pie-element-multiple-choice-config"
  //   );
  //   const model = await configEl.getProperty("model");
  //   expect(model.test).toEqual("test");

  //   await page.$eval(
  //     "pie-author",
  //     (elm: any, prop) => {
  //       elm.config = prop;
  //     },
  //     copy
  //   );
  //   await page.waitForChanges();
  //   const copyConfigEl = await page.find(
  //     "pie-author pp-pie-element-multiple-choice-config"
  //   );
  //   const copyModel = await copyConfigEl.getProperty("model");
  //   expect(copyModel.test).toBeUndefined();
  // });

  // it("sets config settings if present", async () => {
  //   await page.setContent("<pie-author></pie-author>");
  //   pieAuthor = await page.find("pie-author");
  //   await page.waitForSelector("pie-author.hydrated");
  //   await setupInterceptPieCloud(page, pie);
  //   await page.$eval(
  //     "pie-author",
  //     async (elm: any, { config, configSettings }) => {
  //       elm.config = config;
  //       elm.configSettings = configSettings;
  //       return elm;
  //     },
  //     {
  //       config: pieMock,
  //       configSettings: { "@pie-element/multiple-choice": { foo: "bar" } },
  //     }
  //   );

  //   await page.waitForChanges();
  //   await page.waitForSelector("pp-pie-element-multiple-choice-config[model]");
  //   const configEl = await page.find("pp-pie-element-multiple-choice-config");
  //   const configProp = await configEl.getProperty("configuration");

  //   expect(configProp.foo).toEqual("bar");
  // });

  // it("add a rubric before adding config", async () => {
  //   await page.setContent("<pie-author></pie-author>");
  //   pieAuthor = await page.find("pie-author");
  //   await setupInterceptPieCloud(page, pie);
  //   const rubricAdded = await pieAuthor.callMethod(
  //     "addRubricToConfig",
  //     pieMock,
  //     { foo: "bar" }
  //   );
  //   expect(Object.values(rubricAdded.elements)).toContain(
  //     "@pie-element/rubric"
  //   );

  //   pieAuthor.setProperty("config", rubricAdded);
  //   await page.waitForChanges();
  //   await page.waitForSelector(`pp-pie-element-rubric-config:defined`, {
  //     timeout: 1000,
  //   });

  //   const rubricModel = await page.$eval(
  //     `pie-author pp-pie-element-rubric-config`,
  //     (el) => (el as any).model
  //   );
  //   expect(rubricModel.foo).toEqual("bar");
  // });

  // it("can switch items", async () => {
  //   await page.setContent(
  //     '<pie-author add-preview="true" config="evan"></pie-author>'
  //   );
  //   await setupInterceptPieCloud(page, "@pie-element");
  //   pieAuthor = await page.find("pie-author");
  //   pieAuthor.setProperty("config", multipleChoiceItem);
  //   await page.waitForChanges();
  //   await page.waitForSelector(
  //     "pie-author pp-pie-element-multiple-choice-config:defined"
  //   );
  //   const pieModel = await page.$eval(
  //     "pie-author pp-pie-element-multiple-choice-config",
  //     (el) => (el as any).model
  //   );
  //   expect(pieModel.element).toEqual("pp-pie-element-multiple-choice");

  //   const mcPreviewPlayer = await page.find(
  //     ".pie-player pie-player pp-pie-element-multiple-choice"
  //   );

  //   const o = JSON.parse(mcPreviewPlayer.innerHTML);
  //   expect(o.model).toMatchObject({
  //     model: { id: "1", element: "pp-pie-element-multiple-choice" },
  //   });

  //   pieAuthor.setProperty("config", inlineChoiceItem);
  //   await page.waitForChanges();
  //   await page.waitForSelector(
  //     "pie-author pp-pie-element-inline-choice-config:defined"
  //   );
  //   const inlineChoiceModel = await page.$eval(
  //     "pie-author pp-pie-element-inline-choice-config",
  //     (el) => (el as any).model
  //   );

  //   expect(inlineChoiceModel.element).toEqual("pp-pie-element-inline-choice");

  //   const icPreviewPlayer = await page.find(
  //     ".pie-player pie-player pp-pie-element-inline-choice"
  //   );

  //   const switched = JSON.parse(icPreviewPlayer.innerHTML);
  //   expect(switched.model).toMatchObject({
  //     model: { id: "1", element: "pp-pie-element-inline-choice" },
  //   });
  // });
});

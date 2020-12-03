import { E2EPage } from "@stencil/core/testing";
import { setContent, newE2EPage } from "../../test-util/e2e-page-workaround";

import { setupInterceptPieCloud } from "../../test-util/util";
import { simplePieMock, advancedPieMock } from "../../__mock__/config";

function loadPie(itemConfig, playerId: string = "player") {
  var holder = document.querySelector("#player-holder");
  var player = document.createElement("pie-player");
  player.setAttribute("id", playerId);
  holder.appendChild(player);
  player.config = itemConfig;
}

describe("pie-player", () => {
  let page: E2EPage;
  beforeEach(async () => {
    page = await newE2EPage();
  });

  it("foo", () => {
    expect(true).toEqual(true);
  });
  it("passes env chages to PIE", async () => {
    await setContent(page, `<div id="player-holder"></div>`);
    setupInterceptPieCloud(page, "@pie-element/multiple-choice");
    await page.evaluate(loadPie, JSON.stringify(simplePieMock));
    await page.waitForChanges();
    const piePlayer = await page.find("pie-player");
    expect(piePlayer).toBeDefined();
    await piePlayer.setProperty("env", { mode: "evaluate", role: "student" });
    await page.waitForChanges();
    const pieElement = await page.waitForSelector(
      "pie-player pp-pie-element-multiple-choice"
    );
    expect(pieElement).toBeDefined();
    const model = await page.$eval(
      "pie-player pp-pie-element-multiple-choice",
      (el) => (el as any).model
    );
    expect(model.env.mode).toEqual("evaluate");
  });

  it("loads with js, multiple times", async () => {
    await setContent(page, `<div id="player-holder"></div>`);
    setupInterceptPieCloud(page, "@pie-element/multiple-choice");

    await page.evaluate(loadPie, JSON.stringify(simplePieMock), "player1");
    await page.waitForChanges();
    const piePlayer = await page.find("pie-player");
    expect(piePlayer).toBeDefined();
    const pieElement = await page.waitForSelector(
      "pie-player pp-pie-element-multiple-choice"
    );
    expect(pieElement).toBeDefined();
    const model = await page.$eval(
      "pie-player pp-pie-element-multiple-choice",
      (el) => el.getAttribute("model")
    );
    expect(model).toBeTruthy();

    // load it again
    await page.evaluate(loadPie, JSON.stringify(simplePieMock), "player2");
    await page.waitForChanges();

    const secondPlayer = await page.find("pie-player");
    expect(secondPlayer).toBeDefined();
    const secondPieElement = await page.waitForSelector(
      "pie-player:nth-child(2) pp-pie-element-multiple-choice"
    );
    expect(secondPieElement).toBeDefined();
    const model2 = await page.$eval(
      "pie-player:nth-child(2) pp-pie-element-multiple-choice",
      (el) => el.getAttribute("model")
    );
    expect(model2).toBeTruthy();
  });

  describe("preview mode", () => {
    it("loads item with preview", async () => {
      await setContent(page, `<pie-player></pie-player>`);
      setupInterceptPieCloud(page, "@pie-element");
      const piePlayer = await page.find("pie-player");
      await piePlayer.setProperty("addCorrectResponse", true);
      await piePlayer.setProperty("config", simplePieMock);
      await page.waitForChanges();
      await page.waitForSelector(
        "pie-player pp-pie-element-multiple-choice:defined"
      );
      const el = await page.find("pie-player pp-pie-element-multiple-choice");
      const d = JSON.parse(el.innerHTML);
      expect(d.session).toEqual({ correctResponse: true });
    });
  });

  it("loads an item with stimulus", async () => {
    await setContent(page, `<pie-player></pie-player>`);
    setupInterceptPieCloud(page, "@pie-element");
    const piePlayer = await page.find("pie-player");
    await piePlayer.setProperty("config", advancedPieMock);
    await page.waitForChanges();
    expect(piePlayer).toBeDefined();
    const stimulusLayout = await piePlayer.find("pie-stimulus-layout");
    expect(stimulusLayout).toBeDefined();
    const passageModel = await page.$eval(
      "#stimulusPlayer pp-pie-element-passage",
      (el) => el.getAttribute("model")
    );
    expect(passageModel).toBeTruthy();
    const questionModel = await page.$eval(
      "#itemPlayer pp-pie-element-multiple-choice",
      (el) => el.getAttribute("model")
    );
    expect(questionModel).toBeTruthy();
  });

  it("does not render stimulus is renderStimulus is false", async () => {
    await setContent(page, `<pie-player render-stimulus="false"></pie-player>`);
    setupInterceptPieCloud(page, "@pie-element");
    const piePlayer = await page.find("pie-player");
    await piePlayer.setProperty("config", advancedPieMock);
    await page.waitForChanges();
    expect(piePlayer).toBeDefined();
    const stimulusLayout = await piePlayer.find("pie-stimulus-layout");
    expect(stimulusLayout).toBeNull();
  });

  it("emits a load-complete event once when config is loaded", async () => {
    await setContent(page, `<div id="player-holder"></div>`);
    setupInterceptPieCloud(page, "@pie-element/multiple-choice");
    await page.evaluate(loadPie, JSON.stringify(advancedPieMock));
    const loadCompleteSpy = await page.spyOnEvent("load-complete");
    const sessionChangedSpy = await page.spyOnEvent("session-changed");
    await page.waitForChanges();
    await page.waitFor(200);
    expect(loadCompleteSpy).toHaveReceivedEventTimes(1);
    expect(sessionChangedSpy).toHaveReceivedEventTimes(0);
  });

  it("calls controler to set correct response", async () => {
    await setContent(
      page,
      `<pie-player add-correct-response="true"></pie-player>`
    );
    setupInterceptPieCloud(page, "@pie-element");
    const piePlayer = await page.find("pie-player");
    await piePlayer.setProperty("config", simplePieMock);

    await page.waitForChanges();
    expect(piePlayer).toBeDefined();

    await page.waitForChanges();
    const pieElement = await page.waitForSelector(
      "pie-player pp-pie-element-multiple-choice"
    );
    expect(pieElement).toBeDefined();
    const session = await page.$eval(
      "pie-player pp-pie-element-multiple-choice",
      (el) => (el as any).session
    );
    expect(session).toEqual({ correctResponse: true });
  });
});

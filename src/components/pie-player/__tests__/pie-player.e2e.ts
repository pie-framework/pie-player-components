import { newE2EPage, E2EElement, E2EPage } from '@stencil/core/testing';
import { setupInterceptPieCloud } from '../../__tests__/util';
import { simplePieMock, advancedPieMock } from '../../__mock__/config';

function loadPie(itemConfig) {
  var holder = document.querySelector('#player-holder');
  var player = document.createElement('pie-player');
  player.setAttribute('id', 'player');
  holder.appendChild(player);
  player.config = itemConfig;
}

describe('pie-player', () => {
  let page: E2EPage;
  beforeEach(async () => {
    page = await newE2EPage();
  });


  it('passes env chages to PIE', async () => {
    setupInterceptPieCloud(page, '@pie-element/multiple-choice');
    await page.setContent(`<div id="player-holder"></div>`);
    await page.evaluate(loadPie, JSON.stringify(simplePieMock));
    await page.waitForChanges();
    const piePlayer = await page.find('pie-player');
    expect(piePlayer).toBeDefined();
    await piePlayer.setProperty('env', { mode: 'evaluate', role: 'student' });
    await page.waitForChanges();
    const pieElement = await page.waitForSelector(
      'pie-player pie-multiple-choice'
    );
    expect(pieElement).toBeDefined();
    const model = await page.$eval('pie-player pie-multiple-choice', el =>
      (el as any).model
    );
    expect(model.env.mode).toEqual('evaluate');
 
  });

  it('loads with js, multiple times', async () => {
    setupInterceptPieCloud(page, '@pie-element/multiple-choice');
    await page.setContent(`<div id="player-holder"></div>`);
    await page.evaluate(loadPie, JSON.stringify(simplePieMock));
    await page.waitForChanges();
    const piePlayer = await page.find('pie-player');
    expect(piePlayer).toBeDefined();
    const pieElement = await page.waitForSelector(
      'pie-player pie-multiple-choice'
    );
    expect(pieElement).toBeDefined();
    const model = await page.$eval('pie-player pie-multiple-choice', el =>
      el.getAttribute('model')
    );
    expect(model).toBeTruthy();

    // load it again
    await page.evaluate(loadPie, JSON.stringify(simplePieMock));
    await page.waitForChanges();

    const secondPieElement = await page.waitForSelector(
      'pie-player:nth-child(2) pie-multiple-choice'
    );
    expect(secondPieElement).toBeDefined();
    const model2 = await page.$eval(
      'pie-player:nth-child(2) pie-multiple-choice',
      el => el.getAttribute('model')
    );
    expect(model2).toBeTruthy();
  });

  it('loads an item with stimulus', async () => {
    setupInterceptPieCloud(page, '@pie-element');
    await page.setContent(`<pie-player></pie-player>`);
    const piePlayer = await page.find('pie-player');
    await piePlayer.setProperty('config', advancedPieMock);
    await page.waitForChanges();
    expect(piePlayer).toBeDefined();
    const stimulusLayout = await piePlayer.find('pie-stimulus-layout');
    expect(stimulusLayout).toBeDefined();
    const passageModel = await page.$eval('#stimulusPlayer pie-passage', el =>
      el.getAttribute('model')
    );
    expect(passageModel).toBeTruthy();
    const questionModel = await page.$eval(
      '#itemPlayer pie-multiple-choice',
      el => el.getAttribute('model')
    );
    expect(questionModel).toBeTruthy();
  });

  it('does not render stimulus is renderStimulus is false', async () => {
    setupInterceptPieCloud(page, '@pie-element');
    await page.setContent(`<pie-player render-stimulus="false"></pie-player>`);
    const piePlayer = await page.find('pie-player');
    await piePlayer.setProperty('config', advancedPieMock);
    await page.waitForChanges();
    expect(piePlayer).toBeDefined();
    const stimulusLayout = await piePlayer.find('pie-stimulus-layout');
    expect(stimulusLayout).toBeNull();

  });
});

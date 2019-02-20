import { newE2EPage, E2EElement, E2EPage } from '@stencil/core/testing';
import { setupInterceptPieCloud } from '../../__tests__/util';
import { simplePieMock } from '../../__mock__/config';

function loadPie(itemConfig) {
  var holder = document.querySelector('#player-holder');
  var player = document.createElement('pie-player');
  player.setAttribute('id', 'player');
  holder.appendChild(player);
  player.config = itemConfig;
}

describe('pie-player', () => {
  let page: E2EPage, piePlayer: E2EElement;
  beforeEach(async () => {
    page = await newE2EPage();
  });

  it('load pie-player element', async () => {
    setupInterceptPieCloud(page, '@pie-element/multiple-choice');
    await page.setContent(`<pie-player></pie-player>`);
    piePlayer = await page.find('pie-player');
    await piePlayer.setProperty('config', simplePieMock)
    await page.waitForChanges();
    expect(piePlayer).toBeDefined();

    const model = await page.$eval('pie-player pie-multiple-choice', el =>
      el.getAttribute('model')
    );
    expect(model).toBeTruthy();
  });

  it('load with js', async () => {
    setupInterceptPieCloud(page, '@pie-element/multiple-choice');
    await page.setContent(`<div id="player-holder"></div>`);
    await page.evaluate(loadPie, JSON.stringify(simplePieMock));
    await page.waitForChanges();
    piePlayer = await page.find('pie-player');
    expect(piePlayer).toBeDefined();
    const pieElement = await page.waitForSelector('pie-player pie-multiple-choice');
    expect(pieElement).toBeDefined();
    const model = await page.$eval('pie-player pie-multiple-choice', el =>
      el.getAttribute('model')
   );
    expect(model).toBeTruthy();
  });
});

import { newE2EPage, E2EElement, E2EPage } from '@stencil/core/testing';
import { setupInterceptPieCloud } from '../../__tests__/util';
import { simplePieMock, multipleChoiceItem, inlineChoiceItem } from '../../__mock__/config';

describe('pie-author', () => {
  let pie;
  let page: E2EPage, pieAuthor: E2EElement; 
  beforeEach(async () => {
    console.log(`before each called`);
    pie = '@pie-element/multiple-choice';
    page = await newE2EPage();
    
  });
  

  it.skip('renders', async () => {
    const element = await page.find('pie-author');
    expect(element).toHaveClass('hydrated');
  });

  it('loads the PIE Content and packages ', async () => {
 
    await page.setContent('<pie-author config="evan"></pie-author>');
    pieAuthor = await page.find('pie-author');
    setupInterceptPieCloud(page,  pie);
    pieAuthor.setProperty('config', simplePieMock)
    await page.waitForChanges();
    const el = await page.waitForSelector('pie-author');
    expect(el).toBeDefined();
    const pieScript = await page.find('script#multiple-choice');
    expect(pieScript).toBeDefined();

  });

  it('creates new models if models is empty ', async () => {
    setupInterceptPieCloud(page,  pie);
    await page.setContent('<pie-author></pie-author>');
    pieAuthor = await page.find('pie-author');
    expect(pieAuthor).toHaveClass('hydrated');
    await page.waitForChanges();
    const emptyItem = simplePieMock;
    emptyItem.models = null;
    expect(pieAuthor).toBeDefined();
    await pieAuthor.setProperty('config', emptyItem);
    await page.waitForChanges();
    const configEl = await page.find('pie-author pie-multiple-choice-config');
    expect(configEl.nodeName).toEqual('PIE-MULTIPLE-CHOICE-CONFIG');
    const model = await configEl.getProperty('model');
    expect(model.id).toEqual('1');
  });

  it('sets config settings if present', async () => {
    console.log(`setting up intercept`);
    await setupInterceptPieCloud(page,  pie);
    console.log(`finished setting up intercept`);

    await page.setContent('<pie-author config="evan"></pie-author>');
    await page.evaluate(() => {debugger;}); 
    pieAuthor = await page.find('pie-author');
    
    console.log(`setting config`);
    pieAuthor.setProperty('configSettings', {'@pie-element/multiple-choice': { "foo": "bar"} });
    pieAuthor.setProperty('config', simplePieMock);
    console.log(`waiting for changes`);
    await page.waitForChanges();
    console.log(`after wait for changes`);
    const el = await page.waitForSelector('pie-author');
    expect(el).toBeDefined();
    const configEl = await page.find('pie-author pie-multiple-choice-config');
    const configure = await configEl.getProperty('configure');
    expect(configure.foo).toEqual("bar");

  });

  it.skip('can switch items', async() => {
    await page.setContent('<pie-author config="evan"></pie-author>');
    setupInterceptPieCloud(page,  pie);
    pieAuthor = await page.find('pie-author');
    pieAuthor.setProperty('config', multipleChoiceItem);
    await page.waitForChanges();
    await page.waitForSelector('pie-author pie-multiple-choice-config:defined');
    const pieModel = await page.$eval(
      'pie-author pie-multiple-choice-config',
      el => (el as any).model
    );
    expect(pieModel.element).toEqual('pie-multiple-choice');

    setupInterceptPieCloud(page,  `@pie-element/inline-choice`);
    pieAuthor.setProperty('config', inlineChoiceItem);
    await page.waitForChanges();
    await page.waitForSelector('pie-author pie-inline-choice-config:defined');
    const inlineChoiceModel = await page.$eval(
      'pie-author pie-inline-choice-config',
      el => (el as any).model
    );
    expect(inlineChoiceModel.element).toEqual('pie-inline-choice');
  });

});

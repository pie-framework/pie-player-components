import { newE2EPage, E2EElement, E2EPage } from '@stencil/core/testing';
import { setupInterceptPieCloud } from '../../test-util/util';
import { simplePieMock, multipleChoiceItem, inlineChoiceItem } from '../../__mock__/config';

describe('pie-author', () => {
  let pie;
  let page: E2EPage, pieAuthor: E2EElement; 
  beforeEach(async () => {
    pie = '@pie-element/multiple-choice';
    page = await newE2EPage()
  });
  

  it('renders', async () => {
    await page.setContent('<pie-author config="evan"></pie-author>');
    const element = await page.find('pie-author');
    expect(element).toHaveClass('hydrated');
  });

  it('loads the PIE Content and packages ', async () => {
 
    await page.setContent('<pie-author config="evan"></pie-author>');
    pieAuthor = await page.find('pie-author');
    await setupInterceptPieCloud(page,  pie);
    pieAuthor.setProperty('config', simplePieMock)
    await page.waitForChanges();
    const el = await page.waitForSelector('pie-author');
    expect(el).toBeDefined();
    const pieScript = await page.find('script#multiple-choice');
    expect(pieScript).toBeDefined();

  });

  it('gets modelLoaded event', async () => {
 
    await page.setContent('<pie-author config="evan"></pie-author>');
    pieAuthor = await page.find('pie-author');
    await setupInterceptPieCloud(page,  pie);
    pieAuthor.setProperty('config', simplePieMock)
    const spy = await page.spyOnEvent('modelLoaded');
    await page.waitForChanges();
    expect(spy).toHaveReceivedEvent();
  
  });

  it('creates new models if models is empty ', async () => {
    await page.setContent('<pie-author></pie-author>');
    pieAuthor = await page.find('pie-author');
    await setupInterceptPieCloud(page,  pie);
    const emptyItem = simplePieMock;
    emptyItem.models = null;
    await page.$eval('pie-author',
      (elm: any, prop) => {
        elm.config = prop;
      },
      emptyItem 
    );

    await page.waitForChanges();
    const configEl = await page.find('pie-author pie-multiple-choice-config');
    const model = await configEl.getProperty('model');
    expect(model.id).toEqual('1');
  });

  it('sets config settings if present', async () => {

    await page.setContent('<pie-author></pie-author>');
    pieAuthor = await page.find('pie-author');
    await page.waitForSelector('pie-author.hydrated');
    await setupInterceptPieCloud(page,  pie);
    await page.$eval('pie-author',
      async (elm: any, {config, configSettings}) => {
        elm.config = config;
        elm.configSettings = configSettings;
        return elm;
      },
      {
        config: simplePieMock, 
        configSettings: {'@pie-element/multiple-choice': { "foo": "bar"} }
      } 
    );



    await page.waitForChanges();
    await page.waitForSelector('pie-multiple-choice-config[model]')
    const configEl = await page.find('pie-multiple-choice-config');
    const configProp = await configEl.getProperty('configuration');
    
    expect(configProp.foo).toEqual("bar");
  });

  // TODO request intercetpion needs to be updated for this to work
  it.skip('can switch items', async() => {
    await page.setContent('<pie-author config="evan"></pie-author>');
    await setupInterceptPieCloud(page,  pie);
    pieAuthor = await page.find('pie-author');
    pieAuthor.setProperty('config', multipleChoiceItem);
    await page.waitForChanges();
    await page.waitForSelector('pie-author pie-multiple-choice-config:defined');
    const pieModel = await page.$eval(
      'pie-author pie-multiple-choice-config',
      el => (el as any).model
    );
    expect(pieModel.element).toEqual('pie-multiple-choice');

    console.log(`got past first item`)
    await setupInterceptPieCloud(page,  `@pie-element/inline-choice`);
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

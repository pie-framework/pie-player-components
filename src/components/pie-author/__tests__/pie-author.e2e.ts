import { newE2EPage, E2EElement, E2EPage } from '@stencil/core/testing';
import { setupInterceptPieCloud } from '../../__tests__/util';
import { simplePieMock } from '../../__mock__/config';

describe('pie-author', () => {
  let pie;
  let page: E2EPage, pieAuthor: E2EElement; 
  beforeEach(async () => {
    pie = '@pie-element/multiple-choice';
    page = await newE2EPage();
  });

  it.skip('renders', async () => {
    const element = await page.find('pie-author');
    expect(element).toHaveClass('hydrated');
  });

  it('loads the PIE Content and packges ', async () => {
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
});

import { newE2EPage } from '@stencil/core/testing';
import { simplePieMock } from '../__mock__/config';

describe('pie-cloud-loader', () => {
  it('creates author element', async () => {
    const page = await newE2EPage();

    await page.setContent('<pie-cloud-loader></pie-cloud-loader>');
    const element = await page.find('pie-cloud-loader');
    element.callMethod('createAuthor', {config: simplePieMock});
    await page.waitForChanges();
    const authorEl = await element.find('pie-author');
    expect(authorEl).toHaveClass('hydrated');
  });

  it('renders changes to the name data', async () => {
    const page = await newE2EPage();

    // await page.setContent('<pie-author></pie-author>');
    // const component = await page.find('pie-author');
    // const element = await page.find('pie-author >>> div');
    // expect(element.textContent).toEqual(`Hello, World! I'm `);

    // component.setProperty('first', 'James');
    // await page.waitForChanges();
    // expect(element.textContent).toEqual(`Hello, World! I'm James`);

    // component.setProperty('last', 'Quincy');
    // await page.waitForChanges();
    // expect(element.textContent).toEqual(`Hello, World! I'm James Quincy`);

    // component.setProperty('middle', 'Earl');
    // await page.waitForChanges();
    // expect(element.textContent).toEqual(`Hello, World! I'm James Earl Quincy`);
  });
});

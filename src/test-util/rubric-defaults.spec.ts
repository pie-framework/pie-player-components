import { addRubric } from '../rubric-defaults';
import { PieContent } from '../interface';

let pieContent: PieContent = {
  id: '1',
  elements: {
    'pie-rubric': '@pie-element/rubric@latest'
  },
  models: [
    {
      id: 'x',
      element: 'pie-rubric'
    }
  ],
  markup: 'markup here'
}

describe('rubric defaults', () => {

  it('adds rubric to markup', () => {  
    const handled = addRubric(pieContent);
    expect(handled.markup).toMatch(/pie-rubric/)
  });

  it('do nothing if in markup', () => {  
    const content = {...pieContent, markup: '<pie-rubric id="x"></pie-rubric>'};
    const handled = addRubric(content);
    expect(handled).toEqual(content);
  });


  it('do nothing if no rubric', () => {  
    const content = {
      id: '1',
      elements: {
        'pie-rubric': '@pie-element/something-else@latest'
      },
      models: [
        {
          id: 'x',
          element: 'pie-rubric'
        }
      ],
      markup: 'markup here'
    };
    const handled = addRubric(content);
    expect(handled).toEqual(content);
  });  
});
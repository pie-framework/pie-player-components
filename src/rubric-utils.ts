import { PieContent, PieModel } from './interface';
import {
  modelsForPackage,
  elementForPackage,
  pieShortIdGenerator,
  elementsHasPackage
} from './utils/utils';


/**
 * Allows you to modify the markup for a package that is present in elements/model but
 * missing from markup.
 * @param content the pie content
 * @param npmPackage the npm package
 * @param template a callback function for modifing the markup
 */
export const addMarkupForPackage = (
  content: PieContent,
  npmPackage: string,
  template: (id, tag: string, markup: string) => string
): PieContent => {
  const elem = content && elementForPackage(content, npmPackage);
  if (elem && modelsForPackage(content, npmPackage).length > 0) {
    if (content.markup !== null && !content.markup.match(/elem/)) {
      const id =
        content.models && content.models.find(m => m.element === elem).id;
      if (id) {
        content.markup = template(id, elem, content.markup);
      }
    }
  }
  return content;
};

/**
 * Adds rubric html to markup.
 * @param content
 */
export const addRubric = (content: PieContent): PieContent => {
  return addMarkupForPackage(
    content,
    '@pie-element/rubric',
    (id, tag, markup) => {
      return `
    ${markup}
    <div style="width: 75%">
      <${tag} id="${id}"></${tag}>
    </div>
    `;
    }
  );
};

/**
 * Adds the provided package to the provided PieContent Object's `elements` and `models` properties.
 * 
 * @param content the PieContent for rendering
 * @param packageToAdd the NPM Package to add to the content config
 * @param model optional the PieModel to add, `id` and `element` properties will be replaced by this function if present
 */
export const addPackageToContent = (content: PieContent, packageToAdd, model?:PieModel) => {

  if (packageToAdd && !elementsHasPackage(content.elements, packageToAdd)) {
    model = model ? model : {} as any;
    // add package
    model.id = pieShortIdGenerator();
    const elementName = pieShortIdGenerator();
    model.element = elementName;
    content.models && content.models.push(model);
    content.elements && (content.elements[elementName] = packageToAdd);
    return content;
  }
  
};

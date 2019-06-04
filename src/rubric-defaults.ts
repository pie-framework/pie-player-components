import { PieContent } from './interface';
import {
  modelsForPackage,
  elementForPackage
} from './utils/utils';

/**
 * Allows you to modify the markup for a package that is present in elements/model but
 * missing from markup.
 * @param content the pie content
 * @param npmPackage the npm pacakge
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

import {PieContent, PieModel} from "./interface";
import {
  modelsForPackage,
  elementForPackage,
  pieShortIdGenerator,
  elementsHasPackage
} from "./utils/utils";
import cloneDeep from "lodash/cloneDeep";

export const COMPLEX_RUBRIC = 'complex-rubric';


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
  const out = cloneDeep(content);
  const elem = out && elementForPackage(out, npmPackage);
  if (elem && modelsForPackage(out, npmPackage).length > 0) {
    const match = out.markup.match(new RegExp(elem));
    if (out.markup !== null && !match) {
      const id = out.models && out.models.find(m => m.element === elem).id;
      if (id) {
        out.markup = template(id, elem, out.markup);
      }
    }
  }
  return out;
};

export const complexRubricChecks = (content: PieContent) => {
  const elements = content.elements || {};
  const elementsKeys = Object.keys(elements || {});
  // rubricElements: if @pie-element/complex-rubric is one of the config's elements
  const rubricElements = elementsKeys.filter(key => elements[key] && elements[key].indexOf(COMPLEX_RUBRIC) >= 0);
  // complexRubricItemsLength: how many complex-rubric elements are declared
  const complexRubricItemsLength = rubricElements.length;

  if (complexRubricItemsLength === elementsKeys.length) {
    // if item config ONLY has complex-rubrics, then all the steps below are not necessary
    // this is added to treat the special case of testing complex-rubric (as single item type) in pie-website
    return {};
  }

  // if at least one model has rubricEnabled = true, then we should have complex-rubric in the config
  const shouldHaveComplexRubric = (content.models || []).filter(model => model.rubricEnabled).length;

  return {
    shouldAddComplexRubric: shouldHaveComplexRubric && !complexRubricItemsLength,
    shouldRemoveComplexRubric: !shouldHaveComplexRubric && complexRubricItemsLength,
    rubricElements
  }
}


/**
 * Removes complex-rubric html from markup.
 */
export const removeComplexRubricFromMarkup = (content: PieContent, rubricElements: string[], doc): string => {
  const tempDiv = doc.createElement("div");

  tempDiv.innerHTML = content.markup;

  const elsWithId = tempDiv.querySelectorAll("[id]");

  elsWithId.forEach(el => {
    const pieElName = el.tagName.toLowerCase().split("-config")[0];

    // we have to remove the complex-rubric item from the markup
    if (rubricElements.includes(pieElName)) {
      try {
        tempDiv.querySelector(`#${el.id}`).remove();
      } catch (e) {
        console.log(e.toString());
      }
    }
  });

  const newMarkup = tempDiv.innerHTML;

  tempDiv.remove();

  return newMarkup;
}


/**
 * Adds complex-rubric html to markup.
 * @param content
 */
export const addComplexRubric = (content: PieContent): PieContent => {
  return addMarkupForPackage(
    cloneDeep(content),
    `@pie-element/${COMPLEX_RUBRIC}`,
    (id, tag, markup) => {
      return `${markup}<${tag} id="${id}"></${tag}>`;
    }
  );
};

/**
 * Adds rubric html to markup.
 * @param content
 */
export const addRubric = (content: PieContent): PieContent => {
  return addMarkupForPackage(
    cloneDeep(content),
    "@pie-element/rubric",
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
 * Adds multi-trait-rubric html to markup.
 * @param content
 */
export const addMultiTraitRubric = (content: PieContent): PieContent => {
  return addMarkupForPackage(
    cloneDeep(content),
    "@pie-element/multi-trait-rubric",
    (id, tag, markup) => {
      return `
    ${markup}
    <div style="margin-top: 20px;">
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
export const addPackageToContent = (
  content: PieContent,
  packageToAdd,
  model?: PieModel
) => {
  if (packageToAdd && !elementsHasPackage(content.elements, packageToAdd)) {
    model = model ? model : ({} as any);
    // add package
    model.id = pieShortIdGenerator();
    const elementName = pieShortIdGenerator();
    model.element = elementName;
    content.models && content.models.push(model);
    content.elements && (content.elements[elementName] = packageToAdd);
    return content;
  }
};

import parseNpm from 'parse-package-name';
import { PieContent, AdvancedItemConfig, PieItemElement, PieModel } from '../interface';

export const getPackageWithoutVersion = packages => {
  const packagesArray = packages.split('+');
  const newPackageArray = [];

  packagesArray.forEach(p => newPackageArray.push(parseNpm(p).name));

  return newPackageArray.join('+');
};

/**
 * See if the `PieContent.elements` set contains the provided package.
 * 
 * @param elements the elements dict
 * @param npmPackage the npm package to locate
 */
export const elementsHasPackage = (
  elements: PieItemElement,
  npmPackage: string
): boolean => {
  if (elements) {
    const packageToFind = parseNpm(npmPackage).name;
    return Object.values(elements).find(
      val => packageToFind === parseNpm(val).name
    )
      ? true
      : false;
  } else {
    return false;
  }
};

/**
 * Gets all models defined for a given npmPacakge in `PieContent` 
 * @param pieContent the pie content 
 * @param npmPackage npm package name 
 */
export const modelsForPackage = (pieContent: PieContent, npmPackage: string): PieModel[] => {
  if (pieContent && pieContent.models && pieContent.elements && npmPackage) {

    const element = elementForPackage(pieContent, npmPackage);
    return pieContent.models.filter(m => {
     return element === m.element 
    });
    
  } else {
    return [];
  }
 
}

/**
 * Gets the element tag defined for a package.
 * @param pieContent the pie content
 * @param npmPackage npm package name
 */
export const elementForPackage = (pieContent: PieContent, npmPackage: string): string => {
  const elems = (pieContent && pieContent.elements) ?
   Object.keys(pieContent.elements).filter(
    elTag => {
      const pkg = pieContent.elements[elTag];
      return parseNpm(npmPackage).name ===  parseNpm(pkg).name
    }
  ) : [];
  if (elems.length > 1) {
    throw(new Error('invalid item format: multiple elements for package.'));
  } else {
    return elems[0];
  }
};

export const getPackageBundleUri = (pies: PieItemElement) => {
  return encodeURI(Object.values(pies).join('+'));
};

export const pieContentFromConfig = (config: any): PieContent => {
  try {
    if (typeof config == 'string') {
      config = JSON.parse(config);
    }
    if (config.pie) {
      const ac = config as AdvancedItemConfig;
      return ac.pie;
    } else if (config.elements) {
      const pc = config as PieContent;
      return pc;
    } else {
      console.warn(`invalid pie data model: ${JSON.stringify(config)}`);
      return null;
    }
  } catch (err) {
    console.warn(`invalid pie model: ${JSON.stringify(config)}`);
    return null;
  }
};

export const patchMDCSwitchFocus = element => {
  let lock = 0;
  element.addEventListener(
    'mouseup',
    e => {
      if (lock) return;
      let { target } = e;
      do {
        if (
          target.classList &&
          target.classList.contains('mdc-ripple-upgraded--background-focused')
        ) {
          lock++;
          target.classList.remove('mdc-ripple-upgraded--background-focused');
          lock--;
          return;
        }
      } while ((target = target.parentNode));
    },
    { passive: true }
  );
};

/**
 * Creates short id for use within pie models.
 * Can be used to create random element tag or model id.
 */
export const pieShortIdGenerator = () => {
  // Not an advanced algorighm, but only need to be unique within the current model.
  var S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return `p-${S4() + S4()}`;
}
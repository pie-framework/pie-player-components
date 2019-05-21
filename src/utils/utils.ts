import parseNpm from 'parse-package-name';
import { PieContent, AdvancedItemConfig, PieItemElement } from '../interface';

export const getPackageWithoutVersion = packages => {
  const packagesArray = packages.split('+');
  const newPackageArray = [];

  packagesArray.forEach(p => newPackageArray.push(parseNpm(p).name));

  return newPackageArray.join('+');
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

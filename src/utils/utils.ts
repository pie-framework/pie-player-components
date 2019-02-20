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
}

export const pieContentFromConfig = (config: any): PieContent => {
  try {
    if (typeof config == 'string')  {
      config = JSON.parse(config);
    }
    if (config.pie) {
      const ac = config as AdvancedItemConfig;
      return ac.pie;
    } else if (config.elements)  {
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

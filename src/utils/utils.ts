import parseNpm from 'parse-package-name';
import { PieContent, AdvancedItemConfig } from '../interface';

export const getPackageWithoutVersion = packages => {
  const packagesArray = packages.split('+');
  const newPackageArray = [];

  packagesArray.forEach(p => newPackageArray.push(parseNpm(p).name));

  return newPackageArray.join('+');
};



export const pieContentFromConfig = (config: any): PieContent => {
  try {
    if (config.pie) {
      const ac = config as AdvancedItemConfig;
      return ac.pie;
    } else {
      const pc = config as PieContent;
      return pc;
    }
  } catch (err) {
    console.warn('invalid pie model');
    return null;  
  }
};

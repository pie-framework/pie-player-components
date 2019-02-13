import isFunction from 'lodash/isFunction';
import { getPackageWithoutVersion } from './utils/utils';
import { PieItemElement } from './interface';
import { BUILD_SERVICE_BASE } from './defaults';

enum Status {
  loading,
  loaded
}

interface Entry {
  package: string;
  status: Status;
  tagName: string;
  controller?: any;
  config?: Element;
  element?: Element;
}

interface Registry {
  [key:string]: Entry
}

/**
 * Pie Registry contols the loading of all PIEs from the pie build service
 */
export namespace PieLoader {

  console.log(`INIT REGISTRY...`);
  window['PIE_REGISTRY'] = window['PIE_REGISTRY'] ? window['PIE_REGISTRY'] : {};
  export const registry: Registry = window['PIE_REGISTRY'];


  export const getController = (pieTagName: string) => {
     return registry[pieTagName].controller;
  }

  const getEmptyConfigure = () =>
    class extends HTMLElement {
      set model(_) {}
    };
    


  /**
   * TODO check the registy to see if elements are loaded/loading already
   * if they are, check package version, if duplicate is different version prepare to load and modify component tags in markup 
   * if not prepare to load
   */
  // const getPackagesToLoad = (pieConfig: PieContent) => {
   
  // } 
  /**
   *
   * @param {Object<string,string>} elements elements to load from pie cloud service
   * @param {HTMLDocument} doc - the document to load the scripts
   * @param {string} base_url - default base url for cloud service
   */
  export const loadCloudPies = (
    elements: PieItemElement,
    doc,
    base_url = BUILD_SERVICE_BASE
  ) => {

    const head = doc.getElementsByTagName('head')[0];
    const keys = Object.keys(elements);
    console.log(`----loadCloudPies ${JSON.stringify(keys)}`);
    for (const key in keys) {
      const elementName = keys[key];
      const npmPackage: string = elements[elementName];
      const packageWithoutVersion = getPackageWithoutVersion(npmPackage);
      const script = doc.createElement('script');
      const onloadFn = (_package => {
        console.log('----on load function');
        return () => {
          const packages = _package.split('+');
          const elementsName = elementName.split('+');

          packages.forEach((pack, index) => {
            const pie = window['pie'].default[pack];
            const initialEl = elementsName[index];
            const atSymbolPos = initialEl.indexOf('@');
            const elName =
              atSymbolPos >= 0 ? initialEl.slice(0, atSymbolPos) : initialEl;
            console.log('defining elements');

            if (!customElements.get(elName)) {
              customElements.define(elName, pie.Element);

              registry[elName] = {
                package: _package,
                status: Status.loading,
                tagName: elName
              }

              console.log(`registry updated in onload.... ${JSON.stringify(PieLoader.registry)}`);
              customElements.whenDefined(elName).then(async () => {
                console.log(`updating registery in whendefined...`);
                registry[elName].status = Status.loaded;
                registry[elName].element = customElements.get(elName);
                registry[elName].controller = pie.controller;
              });
              // This fixes some cases where the pie build service fails
              pie.Configure = isFunction(pie.Configure)
                ? pie.Configure
                : getEmptyConfigure();

              const configElName = elName + '-config';
              customElements.define(configElName, pie.Configure);

              customElements.whenDefined(configElName).then(async () => {
                registry[elName].config = customElements.get(configElName);
              });
            }
          });
        };
      })(packageWithoutVersion);

      script.id = elementName;
      script.onload = onloadFn;
      script.src = base_url + npmPackage + '/editor.js';
      console.log(`appending ${JSON.stringify(script.src)}`);
      head.appendChild(script);
    }
  }

}

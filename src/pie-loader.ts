import isFunction from 'lodash/isFunction';
import { getPackageWithoutVersion } from './utils/utils';
import {
  PieItemElement,
  PieContent
} from './interface';
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
  [key: string]: Entry;
}

/**
 * Pie Registry contols the loading of all PIEs from the pie build service
 */
export namespace PieLoader {
  window['PIE_REGISTRY'] = window['PIE_REGISTRY'] ? window['PIE_REGISTRY'] : {};
  export const registry: Registry = window['PIE_REGISTRY'];

  export const getController = (pieTagName: string) => {
    return registry[pieTagName].controller;
  };

  const getEmptyConfigure = () =>
    class extends HTMLElement {
      set model(_) {}
    };

  export const elementsHaveLoaded = (el): Promise<boolean> => {
    const undefinedElements = el.querySelectorAll(':not(:defined)');
    if (undefinedElements.length == 0) {
      return Promise.resolve(false);
  }

    const promises = [...undefinedElements].map(e =>
      customElements.whenDefined(e.localName)
    );
    return Promise.all(promises)
      .then(() => {
        return Promise.resolve(true);
      })
      .catch(() => {
        return Promise.resolve(false);
      });
  };

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

    for (const key in keys) {
      const elementName = keys[key];
      const npmPackage: string = elements[elementName];
      const packageWithoutVersion = getPackageWithoutVersion(npmPackage);

      const script = doc.createElement('script');
      const onloadFn = (_package => {
        return () => {
          const packages = _package.split('+');
          const elementsName = elementName.split('+');

          packages.forEach((pack, index) => {
            const pie = window['pie'].default[pack];
            const initialEl = elementsName[index];
            const atSymbolPos = initialEl.indexOf('@');
            const elName =
              atSymbolPos >= 0 ? initialEl.slice(0, atSymbolPos) : initialEl;

            if (!customElements.get(elName)) {
              customElements.define(elName, pie.Element);

              registry[elName] = {
                package: _package,
                status: Status.loading,
                tagName: elName
              };

              customElements.whenDefined(elName).then(async () => {
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
                registry[elName].config = customElements.get(
                  configElName
                );
              });
            }
          });
        };
      })(packageWithoutVersion);

      script.id = elementName;
      script.onload = onloadFn;
      script.src = base_url + npmPackage + '/editor.js';

      head.appendChild(script);
    }
  };

  export const convertPieContent = (
    content: PieContent,
    forAuthoring = true
  ): PieContent => {
    let c = content;
    // todo make authoring configs markup point to -config element
    // todo if markup is present, replace in-place with  new tags
    // todo if no markup , add markup with sequence of tags
    if (forAuthoring) {
      const tags = content.models.map(model => {
        return `<${model.element}-config id="${model.id}"></${
          model.element
        }-config>`;
      });
      c.markup = tags.join('');
    }

    return c;
  };
}

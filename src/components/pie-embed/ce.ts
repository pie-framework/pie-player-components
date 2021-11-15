const definitions = new Map();

/**
 * Make sure only 1 define call is made for an element.
 * @param name
 * @param def
 * @returns
 */
export const define = (name: string, def: any) => {
  console.log("define:", name);
  const existing = definitions.get(name);

  console.log("existing:", existing);
  if (existing) {
    if (existing.ready) {
      return;
    }
    if (existing.inProgress) {
      return;
    }

    if (existing.error) {
      throw existing.error;
    }
  }

  definitions.set(name, { inProgress: true });

  try {
    customElements.define(name, def);
  } catch (e) {
    /**
     * It can be the case that different tags will use the same CustomElement.
     * We don't want to process all the markup so we wrap the definition in an anonymous class.
     */
    if (e && (e as any).code === DOMException.NOT_SUPPORTED_ERR) {
      try {
        if (customElements.get(name)) {
          return;
        }
        customElements.define(name, class extends def {});
      } catch (e) {
        console.error("wrapped class failed");
        definitions.set(name, { inProgress: false, error: e });
      }
    } else {
      definitions.set(name, { inProgress: false, error: e });
    }
  }

  customElements
    .whenDefined(name)
    .then(() => {
      definitions.set(name, { inProgress: false, ready: true });
    })
    .catch(e => {
      definitions.set(name, { inProgress: false, error: e });
    });
};

export const status = (
  name: string
): "error" | "inProgress" | "none" | "inRegistry" => {
  const existing = definitions.get(name);

  if (existing) {
    if (existing.inProgress) {
      return "inProgress";
    }
    if (existing.ready) {
      return "inRegistry";
    }

    if (existing.error) {
      return "error";
    }
  }
  return "none";
};

export const whenDefined = (name: string): Promise<void> => {
  return customElements.whenDefined(name);
};

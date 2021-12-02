import { define, whenDefined } from "./ce";

const prepareUrl = (u: string) => {
  if (u.startsWith("http")) {
    return u;
  }
  if (u.startsWith("/")) {
    return u;
  }
  return `https://cdn.jsdelivr.net/npm/${u}`;
};

export const load = (tag, url) => {
  const def = customElements.get(tag);

  if (def) {
    console.log("already defined - skip load");
    return whenDefined(tag);
  }

  const fullUrl = prepareUrl(url);

  return import(fullUrl)
    .then(mod => {
      const Def = mod.definition();
      try {
        define(tag, Def);
      } catch (e) {
        return whenDefined(tag);
      }
    })
    .catch(e => {
      console.error("failed to load: ", url);
    });
};

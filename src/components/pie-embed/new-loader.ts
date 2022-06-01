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

function loadScript(src) {
  return new Promise(function (resolve, reject) {
    let s;

    s = document.createElement('script');
    s.type = 'module';
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export const load = async (tag, url) => {
  const def = customElements.get(tag);

  if (def) {
    console.log("already defined - skip load");
    return whenDefined(tag);
  }

  const fullUrl = prepareUrl(url);

  try {
    await loadScript(fullUrl);
  } catch (e) {
    console.error(e.toString());
  }

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

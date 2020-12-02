import { LegacyPieLoader, needToLoad } from "../legacy-loader";
import { PieContent } from "../../interface";
import { JSDOM } from "jsdom";
import { BundleType } from "../pie-loader";
const reg = (extras: any = {}) => ({ ...extras });

const KEY = "pie-element";

describe("needToLoad", () => {
  const assertNeedToLoad = (bundleType: BundleType) => (
    label: string,
    registry,
    expected: boolean
  ) => {
    it(label, () => {
      const result = needToLoad(registry, bundleType)(`${KEY}@1.0.0`, KEY);
      expect(result).toEqual(expected);
    });
  };

  const assertEditor = assertNeedToLoad(BundleType.editor);
  const assertClientPlayer = assertNeedToLoad(BundleType.clientPlayer);
  const assertPlayer = assertNeedToLoad(BundleType.player);
  assertEditor("undefined reg", undefined, true);
  assertEditor("empty reg", reg(), true);
  assertEditor("with empty reg object", reg({ [KEY]: {} }), true);

  assertEditor(
    "with 3 objects",
    reg({
      [KEY]: {
        config: {},
        controller: {},
        element: {},
      },
    }),
    false
  );

  assertClientPlayer(
    "clientPlayer - missing element",
    reg({ [KEY]: { controller: {} } }),
    true
  );
  assertClientPlayer(
    "clientPlayer - missing controller",
    reg({ [KEY]: { element: {} } }),
    true
  );
  assertClientPlayer(
    "clientPlayer - ok",
    reg({ [KEY]: { controller: {}, element: {} } }),
    false
  );

  assertPlayer("player - ok", reg({ [KEY]: { element: {} } }), false);
  assertPlayer(
    "player - no element",
    reg({ [KEY]: { element: undefined } }),
    true
  );
});

describe("PieLoader", () => {
  let _ce: any;
  beforeAll(() => {
    _ce = global.customElements;

    (global as any).customElements = {
      define: jest.fn(),
      whenDefined: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockReturnValue(undefined),
    };
  });
  afterAll(() => {
    global.customElements = _ce;
  });
  describe("loadCloudPies", () => {
    it("doesnt define configure element when type is clientPlayer", async () => {
      const loader = new LegacyPieLoader();

      const d = new JSDOM({});

      await loader.loadCloudPies({
        bundle: BundleType.clientPlayer,
        content: {
          id: "1",
          models: [],
          markup: "",
          elements: { "pie-el": "pie-el@latest" },
        } as PieContent,
        doc: d.window.document,
        useCdn: false,
      });

      // global.window = d.window;
      (window as any).pie = {
        default: {
          "pie-el": {
            controller: jest.fn(),
            Element: class extends HTMLElement {},
          },
        },
      };
      const scripts = d.window.document.querySelectorAll("script");
      scripts.forEach((s) => {
        s.onload();
      });

      expect(customElements.define).toHaveBeenCalledWith(
        "pie-el",
        expect.anything()
      );
      expect(customElements.define).not.toHaveBeenCalledWith(
        "pie-el-config",
        expect.anything()
      );
    });
  });
});

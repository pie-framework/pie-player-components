import { BundleType, needToLoad, PieLoader } from "../pie-loader";
import { emptyConfigure } from "../components/empty-configure";
import { PieContent } from "../interface";
import { JSDOM } from "jsdom";
const reg = (extras: any = {}) => ({ ...extras });

describe("needToLoad", () => {
  const assertNeedToLoad = (
    label: string,
    registry,
    bundleType: BundleType,
    key: string,
    expected: boolean
  ) => {
    it(label, () => {
      const result = needToLoad(registry, bundleType)(`${key}@1.0.0`, key);
      expect(result).toEqual(expected);
    });
  };

  assertNeedToLoad("empty reg", reg(), BundleType.editor, "pie-element", true);
  assertNeedToLoad(
    "with empty reg object",
    reg({ "pie-element": {} }),
    BundleType.editor,
    "pie-element",
    true
  );

  assertNeedToLoad(
    "with 3 objects",
    reg({
      "pie-element": {
        config: {},
        controller: {},
        element: {}
      }
    }),
    BundleType.editor,
    "pie-element",
    false
  );
});

describe("PieLoader", () => {
  let _ce: any;
  beforeAll(() => {
    _ce = global.customElements;

    global.customElements = {
      define: jest.fn(),
      whenDefined: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockReturnValue(undefined)
    };
  });
  afterAll(() => {
    global.customElements = _ce;
  });
  describe("loadCloudPies", () => {
    it("doesnt define configure element when type is clientPlayer", async () => {
      const loader = new PieLoader();

      const d = new JSDOM({});

      await loader.loadCloudPies({
        bundle: BundleType.clientPlayer,
        content: {
          id: "1",
          models: [],
          markup: "",
          elements: { "pie-el": "pie-el@latest" }
        } as PieContent,
        doc: d.window.document,
        useCdn: false
      });

      // global.window = d.window;
      window.pie = {
        default: {
          "pie-el": {
            controller: jest.fn(),
            Element: class extends HTMLElement {}
          }
        }
      };
      const scripts = d.window.document.querySelectorAll("script");
      scripts.forEach(s => {
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

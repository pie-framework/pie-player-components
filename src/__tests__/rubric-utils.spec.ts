import { addRubric, addPackageToContent } from "../rubric-utils";
import { PieContent, PieModel } from "../interface";
import cloneDeep from "lodash/cloneDeep";

describe("rubric utils", () => {
  let pieContent: PieContent, noRubric: PieContent;
  let rubricModel: PieModel;
  beforeEach(() => {
    pieContent = {
      id: "1",
      elements: {
        "pie-rubric": "@pie-element/rubric@latest"
      },
      models: [
        {
          id: "x",
          element: "pie-rubric"
        }
      ],
      markup: "markup here"
    };

    noRubric = {
      id: "1",
      elements: {
        "something-else": "@pie-element/something-else@latest"
      },
      models: [
        {
          id: "x",
          element: "something-else"
        }
      ],
      markup: "markup here"
    };

    rubricModel = {
      id: "rubric",
      element: "pie-rubric",
      points: ["level 1", "level 2", "level 3", "level 4"],
      maxPoints: 4,
      excludeZero: false
    };
  });

  describe("add rubric to markup", () => {
    it("adds rubric to markup", () => {
      const handled = addRubric(pieContent);
      expect(handled.markup).toMatch(/pie-rubric/);
    });

    it("do nothing if in markup", () => {
      const content = {
        ...pieContent,
        markup: '<pie-rubric id="x"></pie-rubric>'
      };
      const handled = addRubric(content);
      expect(handled).toEqual(content);
    });

    it("do nothing if no rubric", () => {
      const handled = addRubric(noRubric);
      expect(handled).toEqual(noRubric);
    });
  });

  describe("add rubric to model", () => {
    it("adds a rubric to a model", () => {
      addPackageToContent(noRubric, "@pie-element/rubric", rubricModel);
      expect(Object.values(noRubric.elements)).toContain("@pie-element/rubric");
    });

    it("does not modify if rubric already there", () => {
      const copy = cloneDeep(pieContent);
      addPackageToContent(pieContent, "@pie-element/rubric", rubricModel);
      expect(copy).toEqual(pieContent);
    });

    it("works with semver", () => {
      addPackageToContent(noRubric, "@pie-element/rubric@latest", rubricModel);
      expect(Object.values(noRubric.elements)).toContain(
        "@pie-element/rubric@latest"
      );
    });
  });
});

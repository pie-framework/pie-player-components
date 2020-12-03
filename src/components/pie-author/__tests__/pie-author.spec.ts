import { newSpecPage } from "@stencil/core/testing";

jest.mock("@pie-lib/math-rendering", () => ({
  renderMath: jest.fn(),
}));

import { Author } from "../pie-author";

describe("pie-author", () => {
  it("should render my component", async () => {
    const page = await newSpecPage({
      components: [Author],
      html: `<pie-author></pie-author>`,
    });

    expect(page.root.innerHTML).toEqual(`<pie-spinner></pie-spinner>`);
  });

  // describe("modelLoaded", () => {});
});

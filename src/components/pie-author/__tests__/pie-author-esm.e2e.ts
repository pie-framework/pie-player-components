import { newE2EPage, E2EPage } from "@stencil/core/testing";

/**
 * ESM Integration Tests for pie-author
 * 
 * These tests verify that ESM props and behavior work correctly through the pie-author component.
 * Ensures pie-author has the same ESM capabilities as pie-player.
 */

describe("pie-author ESM integration", () => {
  let page: E2EPage;

  const esmTestConfig = {
    elements: {
      "categorize-element": "@pie-element/categorize@11.0.1-esm.0"
    },
    models: [
      {
        id: "1",
        element: "categorize-element"
      }
    ],
    markup: '<categorize-element id="1"></categorize-element>'
  };

  beforeEach(async () => {
    page = await newE2EPage();
  });

  describe("Props Integration", () => {
    it("should accept bundleFormat prop", async () => {
      await page.setContent('<pie-author bundle-format="esm"></pie-author>');
      const author = await page.find("pie-author");
      const bundleFormat = await author.getProperty("bundleFormat");
      expect(bundleFormat).toBe("esm");
    });

    it("should accept esmCdnUrl prop", async () => {
      await page.setContent('<pie-author esm-cdn-url="https://cdn.jsdelivr.net/npm"></pie-author>');
      const author = await page.find("pie-author");
      const cdnUrl = await author.getProperty("esmCdnUrl");
      expect(cdnUrl).toBe("https://cdn.jsdelivr.net/npm");
    });

    it("should accept esmProbeTimeout prop", async () => {
      await page.setContent('<pie-author esm-probe-timeout="2000"></pie-author>');
      const author = await page.find("pie-author");
      const timeout = await author.getProperty("esmProbeTimeout");
      expect(timeout).toBe(2000);
    });

    it("should accept esmProbeCacheTtl prop", async () => {
      await page.setContent('<pie-author esm-probe-cache-ttl="60000"></pie-author>');
      const author = await page.find("pie-author");
      const cacheTtl = await author.getProperty("esmProbeCacheTtl");
      expect(cacheTtl).toBe(60000);
    });
  });

  describe("Bundle Format Modes", () => {
    it("should default to auto mode", async () => {
      await page.setContent('<pie-author></pie-author>');
      const author = await page.find("pie-author");
      const bundleFormat = await author.getProperty("bundleFormat");
      expect(bundleFormat).toBe("auto");
    });

    it("should support explicit esm mode", async () => {
      await page.setContent(`
        <pie-author 
          bundle-format="esm"
          id="author"
        ></pie-author>
      `);

      const author = await page.find("#author");
      const bundleFormat = await author.getProperty("bundleFormat");
      expect(bundleFormat).toBe("esm");
    });

    it("should support iife mode", async () => {
      await page.setContent(`
        <pie-author 
          bundle-format="iife"
          id="author"
        ></pie-author>
      `);

      const author = await page.find("#author");
      const bundleFormat = await author.getProperty("bundleFormat");
      expect(bundleFormat).toBe("iife");
    });
  });

  describe("CDN Configuration", () => {
    it("should use default esm.sh CDN", async () => {
      await page.setContent('<pie-author></pie-author>');
      const author = await page.find("pie-author");
      const cdnUrl = await author.getProperty("esmCdnUrl");
      expect(cdnUrl).toBe("https://esm.sh");
    });

    it("should allow custom CDN URL", async () => {
      await page.setContent(`
        <pie-author 
          esm-cdn-url="https://cdn.jsdelivr.net/npm"
          id="author"
        ></pie-author>
      `);

      const author = await page.find("#author");
      const cdnUrl = await author.getProperty("esmCdnUrl");
      expect(cdnUrl).toBe("https://cdn.jsdelivr.net/npm");
    });
  });

  describe("Consistency with pie-player", () => {
    it("should have identical ESM prop defaults as pie-player", async () => {
      await page.setContent(`
        <div>
          <pie-player id="player"></pie-player>
          <pie-author id="author"></pie-author>
        </div>
      `);

      const playerFormat = await page.$eval("#player", (el: any) => el.bundleFormat);
      const authorFormat = await page.$eval("#author", (el: any) => el.bundleFormat);
      expect(playerFormat).toBe(authorFormat);

      const playerCdn = await page.$eval("#player", (el: any) => el.esmCdnUrl);
      const authorCdn = await page.$eval("#author", (el: any) => el.esmCdnUrl);
      expect(playerCdn).toBe(authorCdn);

      const playerTimeout = await page.$eval("#player", (el: any) => el.esmProbeTimeout);
      const authorTimeout = await page.$eval("#author", (el: any) => el.esmProbeTimeout);
      expect(playerTimeout).toBe(authorTimeout);

      const playerCache = await page.$eval("#player", (el: any) => el.esmProbeCacheTtl);
      const authorCache = await page.$eval("#author", (el: any) => el.esmProbeCacheTtl);
      expect(playerCache).toBe(authorCache);
    });

    it("should handle bundleFormat changes identically to pie-player", async () => {
      await page.setContent(`
        <div>
          <pie-player id="player" bundle-format="esm"></pie-player>
          <pie-author id="author" bundle-format="esm"></pie-author>
        </div>
      `);

      const playerFormat = await page.$eval("#player", (el: any) => el.bundleFormat);
      const authorFormat = await page.$eval("#author", (el: any) => el.bundleFormat);

      expect(playerFormat).toBe("esm");
      expect(authorFormat).toBe("esm");
      expect(playerFormat).toBe(authorFormat);
    });
  });

  describe("Console Logging", () => {
    it("should log ESM detection in auto mode", async () => {
      const logs: string[] = [];
      page.on('console', msg => {
        logs.push(msg.text());
      });

      await page.setContent(`
        <pie-author 
          bundle-format="auto"
          id="author"
        ></pie-author>
      `);

      const author = await page.find("#author");
      await author.setProperty("config", esmTestConfig);
      await page.waitForChanges();
      await page.waitFor(2000);

      // Should see auto-detect logs
      const hasAutoDetectLog = logs.some(log => 
        log.includes('Auto-detect mode') || log.includes('Explicit ESM mode')
      );
      expect(hasAutoDetectLog).toBe(true);
    }, 10000);

    it("should use [pie-author] prefix in logs", async () => {
      const logs: string[] = [];
      page.on('console', msg => {
        logs.push(msg.text());
      });

      await page.setContent(`
        <pie-author 
          bundle-format="esm"
          id="author"
        ></pie-author>
      `);

      const author = await page.find("#author");
      await author.setProperty("config", esmTestConfig);
      await page.waitForChanges();
      await page.waitFor(2000);

      // Should see [pie-author] prefix (not [pie-player])
      const hasAuthorLog = logs.some(log => log.includes('[pie-author]'));
      expect(hasAuthorLog).toBe(true);
    }, 10000);
  });

  describe("Backward Compatibility", () => {
    it("should work without ESM props (default to auto)", async () => {
      await page.setContent('<pie-author></pie-author>');
      const author = await page.find("pie-author");
      
      const bundleFormat = await author.getProperty("bundleFormat");
      expect(bundleFormat).toBe("auto");
    });

    it("should not break existing functionality", async () => {
      await page.setContent('<pie-author id="author"></pie-author>');
      const author = await page.find("#author");
      
      // Should still accept standard props
      await author.setProperty("addRubric", true);
      await page.waitForChanges();
      
      const addRubric = await author.getProperty("addRubric");
      expect(addRubric).toBe(true);
    });
  });

  describe("Author-Specific Features", () => {
    it("should work with addRubric prop", async () => {
      await page.setContent(`
        <pie-author 
          bundle-format="auto"
          add-rubric="true"
          id="author"
        ></pie-author>
      `);

      const author = await page.find("#author");
      const addRubric = await author.getProperty("addRubric");
      const bundleFormat = await author.getProperty("bundleFormat");

      expect(addRubric).toBe(true);
      expect(bundleFormat).toBe("auto");
    });

    it("should work with addPreview prop", async () => {
      await page.setContent(`
        <pie-author 
          bundle-format="esm"
          add-preview="true"
          id="author"
        ></pie-author>
      `);

      const author = await page.find("#author");
      const addPreview = await author.getProperty("addPreview");
      const bundleFormat = await author.getProperty("bundleFormat");

      expect(addPreview).toBe(true);
      expect(bundleFormat).toBe("esm");
    });
  });
});


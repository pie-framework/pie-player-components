export class ResourceManager {
  // Use a global Set to store loaded styles (persists across players)
  private static loadedStyles = new Set<string>();

  async loadStylesheets(stylesheets: Array<{ url: string }>, root: ShadowRoot) {
    console.log("loadStylesheets called with:", stylesheets);
    const promises = stylesheets.map(async (stylesheet) => {
      try {
        await this.loadStylesheet(stylesheet.url, root);
      } catch (error) {
        console.error(`Failed to load stylesheet: ${stylesheet.url}`, error);
      }
    });
    await Promise.all(promises); // Ensures all stylesheets are processed
  }  

  private async loadStylesheet(url: string, root: ShadowRoot): Promise<void> {
    if (ResourceManager.loadedStyles.has(url)) {
      return; // Skip if already loaded globally
    }

    try {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      link.onload = () => ResourceManager.loadedStyles.add(url);
      link.onerror = () => console.error(`Failed to load stylesheet: ${url}`);
      console.log(`Stylesheet loaded: ${url}`);
      root.appendChild(link);
    } catch (error) {
      console.error(`Error loading stylesheet ${url}: ${error.message}`);
    }
  }

  public applyContainer(content: string, container: { markup: string }): string {
    console.log("Applying container", container);
    return container && container.markup ? container.markup.replace("{body}", content) : content;
  }
  
}

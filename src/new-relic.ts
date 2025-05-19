/**
 * New Relic Instrumentation Service
 *
 * A TypeScript service that provides a wrapper around New Relic browser APIs.
 * This service uses lazy initialization to access New Relic only when needed,
 * ensuring that it works even if the host application initializes New Relic
 * after this service is instantiated - or not at all.
 */
export class NewRelicInstrumentationService {
  /**
   * Creates an instance of NewRelicInstrumentationService.
   * @param document - The Document object, used to access the window
   */
  constructor(private document: Document) {}

  /**
   * Gets the New Relic instance from the window object
   * This is called lazily when needed, not at initialization time
   * @returns The New Relic instance or undefined if not available
   */
  private getNewRelic(): any {
    try {
      const window = this.document.defaultView as any;
      return window && window.NREUM ? window.NREUM : undefined;
    } catch (error) {
      console.warn("Failed to access New Relic:", error);
      return undefined;
    }
  }

  /**
   * Check if New Relic is currently available
   * @returns boolean indicating whether New Relic is available
   */
  public isAvailable(): boolean {
    return !!this.getNewRelic();
  }

  // ==============================
  // Traces and Events Methods
  // ==============================

  /**
   * Add a page action (custom event) to New Relic
   * @param eventName - Name of the event
   * @param attributes - Attributes associated with the event
   */
  public addPageAction(
    eventName: string,
    attributes: Record<string, any>
  ): void {
    const newrelic = this.getNewRelic();
    if (newrelic) {
      newrelic.addPageAction(eventName, attributes);
    }
  }

  /**
   * Add information to an in-progress session trace
   * @param attribute - The attribute to add to the trace
   */
  public addToTrace(attribute: Record<string, any>): void {
    const newrelic = this.getNewRelic();
    if (newrelic) {
      newrelic.addToTrace(attribute);
    }
  }

  /**
   * Record a time point when the page is finished according to custom criteria
   */
  public finished(): void {
    const newrelic = this.getNewRelic();
    if (newrelic) {
      newrelic.finished();
    }
  }

  /**
   * Add a custom attribute to subsequent events on the page
   * @param key - The attribute name
   * @param value - The attribute value
   */
  public setCustomAttribute(key: string, value: any): void {
    const newrelic = this.getNewRelic();
    if (newrelic) {
      newrelic.setCustomAttribute(key, value);
    }
  }

  /**
   * Add application version information to subsequent events
   * @param version - The application version
   */
  public setApplicationVersion(version: string): void {
    const newrelic = this.getNewRelic();
    if (newrelic) {
      newrelic.setApplicationVersion(version);
    }
  }

  /**
   * Group page views by setting a page name
   * @param name - The page name
   */
  public setPageViewName(name: string): void {
    const newrelic = this.getNewRelic();
    if (newrelic) {
      newrelic.setPageViewName(name);
    }
  }

  /**
   * Add user ID information to subsequent events on the page
   * @param userId - The user ID
   */
  public setUserId(userId: string): void {
    const newrelic = this.getNewRelic();
    if (newrelic) {
      newrelic.setUserId(userId);
    }
  }

  /**
   * Capture a single browser log event
   * @param message - The log message
   * @param level - Log level (optional)
   * @param context - Additional context (optional)
   */
  public log(
    message: string,
    level?: string,
    context?: Record<string, any>
  ): void {
    const newrelic = this.getNewRelic();
    if (newrelic) {
      newrelic.log(message, level, context);
    }
  }

  /**
   * Wrap an existing logger to capture messages as log events
   * @param logger - The logger to wrap
   */
  public wrapLogger(logger: any): void {
    const newrelic = this.getNewRelic();
    if (newrelic) {
      newrelic.wrapLogger(logger);
    }
  }

  // ==============================
  // Error Reporting Methods
  // ==============================

  /**
   * Tag errors with your app's version information
   * @param releaseName - The release name/version
   */
  public addRelease(releaseName: string): void {
    const newrelic = this.getNewRelic();
    if (newrelic) {
      newrelic.addRelease(releaseName);
    }
  }

  /**
   * Capture a caught or handled error without disrupting the app's operation
   * @param error - The error object
   * @param customAttributes - Optional custom attributes
   */
  public noticeError(error: any, customAttributes?: Record<string, any>): void {
    const newrelic = this.getNewRelic();
    if (newrelic) {
      newrelic.noticeError(error, customAttributes);
    }
  }

  /**
   * Set a custom error handler to ignore specific errors
   * @param errorHandler - Function that returns true if the error should be ignored
   */
  public setErrorHandler(errorHandler: (error: any) => boolean): void {
    const newrelic = this.getNewRelic();
    if (newrelic) {
      newrelic.setErrorHandler(errorHandler);
    }
  }

  // ==============================
  // SPA Tracking Methods
  // ==============================

  /**
   * Return a new API object bound to the current interaction
   * If New Relic is not available, returns a no-op implementation
   */
  public interaction(): any {
    const newrelic = this.getNewRelic();
    if (newrelic) {
      return newrelic.interaction();
    }
    // Return a no-op implementation to prevent errors
    return {
      actionText: () => this,
      createTracer: () => () => {},
      end: () => {},
      getContext: () => ({}),
      ignore: () => {},
      onEnd: () => this,
      save: () => this,
      setAttribute: () => this,
      setCurrentRouteName: () => this
    };
  }

  /**
   * Set the actionText of a SPA interaction
   * @param text - The text of the HTML element clicked
   */
  public setInteractionActionText(text: string): void {
    const interaction = this.interaction();
    interaction.actionText(text);
  }

  /**
   * End a SPA interaction
   */
  public endInteraction(): void {
    const interaction = this.interaction();
    interaction.end();
  }

  /**
   * Add a custom attribute to the current interaction
   * @param key - The attribute name
   * @param value - The attribute value
   */
  public setInteractionAttribute(key: string, value: any): void {
    const interaction = this.interaction();
    interaction.setAttribute(key, value);
  }

  /**
   * Give SPA routes more accurate names than default names
   * @param routeName - The route name
   */
  public setCurrentRouteName(routeName: string): void {
    const interaction = this.interaction();
    interaction.setCurrentRouteName(routeName);
  }

  /**
   * Ignore the current interaction
   */
  public ignoreInteraction(): void {
    const interaction = this.interaction();
    interaction.ignore();
  }

  /**
   * Save the current interaction
   */
  public saveInteraction(): void {
    const interaction = this.interaction();
    interaction.save();
  }

  // ==============================
  // Agent Control Methods
  // ==============================

  /**
   * Start harvesting one or more features
   * @param features - Array of features to start
   */
  public start(features: string[]): void {
    const newrelic = this.getNewRelic();
    if (newrelic) {
      newrelic.start(features);
    }
  }

  /**
   * Manually start session replay collection
   */
  public recordReplay(): void {
    const newrelic = this.getNewRelic();
    if (newrelic) {
      newrelic.recordReplay();
    }
  }

  /**
   * Manually pause session replay collection
   */
  public pauseReplay(): void {
    const newrelic = this.getNewRelic();
    if (newrelic) {
      newrelic.pauseReplay();
    }
  }
}

/**
 * Base class for clients that need New Relic instrumentation
 *
 * This abstract class provides common New Relic initialization and tracking
 * functionality that can be reused across different client implementations.
 */
export abstract class NewRelicEnabledClient {
  protected newRelic: NewRelicInstrumentationService | null = null;

  /**
   * Constructor initializes New Relic automatically
   */
  constructor() {
    // Initialize New Relic on construction
    try {
      this.newRelic = new NewRelicInstrumentationService(document);
      if (!(this.newRelic && this.newRelic.isAvailable())) {
        console.warn("New Relic is initialized but not available");
        this.newRelic = null;
      }
    } catch (error) {
      console.warn("Failed to initialize New Relic instrumentation:", error);
      this.newRelic = null;
    }
  }

  /**
   * Track API activity or errors in New Relic
   */
  protected track(
    type: "activity" | "error",
    name: string,
    attributes: Record<string, any>,
    error?: Error
  ): void {
    if (!this.newRelic) return;

    const commonAttrs = {
      ...attributes,
      timestamp: new Date().toISOString(),
      ...this.getTrackingBaseAttributes()
    };

    if (type === "activity") {
      this.newRelic.addPageAction(name, commonAttrs);
    } else if (error) {
      this.newRelic.noticeError(error, commonAttrs);
    }
  }

  /**
   * Get network information for diagnostics
   */
  protected getNetworkInfo(): Record<string, any> {
    const info: Record<string, any> = {
      online: typeof navigator !== "undefined" && navigator.onLine
    };

    if (typeof navigator !== "undefined" && "connection" in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        info.effectiveType = connection.effectiveType || "unknown";
        info.downlink = connection.downlink || "unknown";
        info.rtt = connection.rtt || "unknown";
        info.saveData = connection.saveData || false;
      }
    }
    return info;
  }

  /**
   * Override this method to provide class-specific attributes for tracking
   */
  protected abstract getTrackingBaseAttributes(): Record<string, any>;
}

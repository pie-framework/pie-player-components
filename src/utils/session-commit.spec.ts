import {
  SESSION_COMMIT_METHOD,
  bindPageLifecycleCommit,
  commitPendingSessions,
  noteSessionBaseline,
  noteSessionObserved
} from "./session-commit";

let tagSeed = 0;

/** An element that owns its deferred notification, as an adopted element does. */
function defineCommittingElement(): string {
  const tag = `pie-committing-${(tagSeed += 1)}`;
  customElements.define(
    tag,
    class extends HTMLElement {
      _session: any = {};
      _pending = false;
      set model(_m: any) {}
      get session() {
        return this._session;
      }
      change(value: any) {
        this._session.value = value;
        this._pending = true;
      }
      [SESSION_COMMIT_METHOD]() {
        if (!this._pending) return;
        this._pending = false;
        this.dispatchEvent(
          new CustomEvent("session-changed", {
            bubbles: true,
            composed: true,
            detail: { complete: true, component: this.tagName.toLowerCase() }
          })
        );
      }
    }
  );
  return tag;
}

/** An element on an older version: synchronous session, no commit hook. */
function defineLegacyElement(): string {
  const tag = `pie-legacy-${(tagSeed += 1)}`;
  customElements.define(
    tag,
    class extends HTMLElement {
      _session: any = {};
      set model(_m: any) {}
      get session() {
        return this._session;
      }
      set session(s: any) {
        this._session = s;
      }
    }
  );
  return tag;
}

function mount(tag: string): any {
  const element = document.createElement(tag);
  document.body.appendChild(element);
  return element;
}

function observeDocument() {
  const events: CustomEvent[] = [];
  const listener = (event: Event) => events.push(event as CustomEvent);
  document.addEventListener("session-changed", listener);
  return {
    events,
    stop() {
      document.removeEventListener("session-changed", listener);
    }
  };
}

describe("commitPendingSessions", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("asks an adopted element to commit while it is still attached", () => {
    const element = mount(defineCommittingElement());
    const observed = observeDocument();

    element.change("answer");
    const result = commitPendingSessions(document.body);
    observed.stop();

    expect(result.committed).toEqual(1);
    expect(observed.events.length).toEqual(1);
    expect(element.isConnected).toEqual(true);
  });

  it("marks an element-owned commit with the reason, so a player's guards let it through", () => {
    // The element dispatches its own event and knows nothing about the sweep.
    // Every guard in a `session-changed`'s way keys on this field to let a
    // commit past - the model-set blocker, the renderer dedupe, the section
    // shells' dedupe, the save-now decision. Unmarked, the commit is the event
    // they all drop.
    const element = mount(defineCommittingElement());
    const observed = observeDocument();

    element.change("answer");
    commitPendingSessions(document.body, { reason: "navigate" });
    observed.stop();

    expect(observed.events[0].detail.sessionCommitReason).toEqual("navigate");
    expect(observed.events[0].detail.complete).toEqual(true);
  });

  it("leaves a synthesized event's own reason alone", () => {
    const element = mount(defineLegacyElement());
    element.session = { id: "el-1", value: "answer" };
    const observed = observeDocument();

    commitPendingSessions(document.body, { reason: "page-hidden" });
    observed.stop();

    expect(observed.events[0].detail.sessionCommitReason).toEqual("page-hidden");
  });

  it("stops marking once the sweep returns", () => {
    // A later `session-changed` the learner caused is not a commit, and a host
    // that saves immediately on one would save on every keystroke.
    const element = mount(defineCommittingElement());
    element.change("answer");
    commitPendingSessions(document.body);

    const observed = observeDocument();
    element.change("a longer answer");
    element[SESSION_COMMIT_METHOD]();
    observed.stop();

    expect(observed.events.length).toEqual(1);
    expect(observed.events[0].detail.sessionCommitReason).toBeUndefined();
  });

  it("announces a session an element's own commit left undispatched", () => {
    // `commitPendingSession()` is a no-op when nothing is pending, and the
    // element's session can still hold something the host never heard - a
    // controller writing into it, or a path that stores a value quietly.
    // Counting the call as the announcement recorded that response as delivered
    // and every later seam then skipped it.
    const element = mount(defineCommittingElement());
    element._session = { id: "el-1" };
    noteSessionObserved(element);
    element._session = { id: "el-1", value: "written elsewhere" };
    const observed = observeDocument();

    const result = commitPendingSessions(document.body, { reason: "teardown" });
    observed.stop();

    expect(result.synthesized).toEqual(1);
    expect(result.committed).toEqual(0);
    expect(observed.events.length).toEqual(1);
    expect(observed.events[0].detail.session).toEqual({
      id: "el-1",
      value: "written elsewhere"
    });
  });

  it("synthesizes an event for an element with no commit hook", () => {
    const element = mount(defineLegacyElement());
    const observed = observeDocument();

    element.session = { id: "el-1", value: "answer" };
    const result = commitPendingSessions(document.body, { reason: "navigate" });
    observed.stop();

    expect(result.synthesized).toEqual(1);
    expect(observed.events[0].detail.session).toEqual({
      id: "el-1",
      value: "answer"
    });
    expect(observed.events[0].detail.sessionCommitReason).toEqual("navigate");
  });

  it("does not announce an element the learner never answered", () => {
    const element = mount(defineLegacyElement());
    const observed = observeDocument();

    element.session = { id: "el-1", element: "multiple-choice" };
    const result = commitPendingSessions(document.body);
    observed.stop();

    expect(result.synthesized).toEqual(0);
    expect(result.skipped).toEqual(1);
    expect(observed.events.length).toEqual(0);
  });

  it("does not announce an untouched element whose session carries part structure", () => {
    // `ebsr` and `explicit-constructed-response` key their parts inside
    // `value`, so an unanswered session is not identity-only and still holds no
    // response.
    const element = mount(defineLegacyElement());
    const observed = observeDocument();

    element.session = {
      id: "el-1",
      element: "ebsr",
      shuffledValues: { partA: ["1", "2"] },
      value: { partA: { id: "partA" }, partB: { id: "partB" } }
    };
    const result = commitPendingSessions(document.body);
    observed.stop();

    expect(result.synthesized).toEqual(0);
    expect(observed.events.length).toEqual(0);
  });

  it("announces a session with a response under a key other than value", () => {
    // `math-inline` writes `response`, `select-text` writes `selectedTokens`.
    // A `value`-only test skips every one of those, answered or not.
    const element = mount(defineLegacyElement());
    const observed = observeDocument();

    element.session = { id: "el-1", element: "math-inline", response: "2x+1" };
    const result = commitPendingSessions(document.body);
    observed.stop();

    expect(result.synthesized).toEqual(1);
    expect(observed.events.length).toEqual(1);
  });

  it("does not announce a session the host already has", () => {
    const element = mount(defineLegacyElement());
    element.session = { id: "el-1", value: "answer" };

    expect(commitPendingSessions(document.body).synthesized).toEqual(1);
    expect(commitPendingSessions(document.body).synthesized).toEqual(0);
  });

  it("announces a response the learner returns to after changing it", () => {
    // A signature the sweep emitted once before is not one the host still
    // holds: answer A, hide, answer B, answer A again, navigate inside the
    // debounce.
    const element = mount(defineLegacyElement());
    element.session = { id: "el-1", value: ["A"] };
    expect(commitPendingSessions(document.body).synthesized).toEqual(1);

    element.session.value = ["B"];
    noteSessionObserved(element);

    element.session.value = ["A"];
    const observed = observeDocument();
    const result = commitPendingSessions(document.body);
    observed.stop();

    expect(result.synthesized).toEqual(1);
    expect(observed.events[0].detail.session).toEqual({
      id: "el-1",
      value: ["A"]
    });
  });

  it("announces a response the learner cleared", () => {
    const element = mount(defineLegacyElement());
    element.session = { id: "el-1", value: "an answer" };
    noteSessionBaseline(document.body);

    element.session.value = "";
    const observed = observeDocument();
    const result = commitPendingSessions(document.body);
    observed.stop();

    expect(result.synthesized).toEqual(1);
    expect(observed.events[0].detail.session).toEqual({ id: "el-1", value: "" });
  });

  it("does not announce a restored response the learner has not touched", () => {
    const element = mount(defineLegacyElement());
    element.session = { id: "el-1", value: ["A"] };
    noteSessionBaseline(document.body);
    const observed = observeDocument();

    const result = commitPendingSessions(document.body);
    observed.stop();

    expect(result.synthesized).toEqual(0);
    expect(observed.events.length).toEqual(0);
  });

  it("commits an item that mixes an adopted and an un-adopted element", () => {
    const adopted = mount(defineCommittingElement());
    const legacy = mount(defineLegacyElement());
    adopted.change("answer");
    legacy.session = { id: "el-2", value: "other" };

    const result = commitPendingSessions(document.body);

    expect(result.committed).toEqual(1);
    expect(result.synthesized).toEqual(1);
  });

  it("ignores elements that are not PIE delivery elements", () => {
    document.body.appendChild(document.createElement("div"));

    expect(commitPendingSessions(document.body)).toEqual({
      committed: 0,
      synthesized: 0,
      skipped: 0
    });
  });

  it("returns an empty result for a missing root", () => {
    expect(commitPendingSessions(null)).toEqual({
      committed: 0,
      synthesized: 0,
      skipped: 0
    });
  });
});

describe("bindPageLifecycleCommit", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  function hide() {
    Object.defineProperty(document, "visibilityState", {
      value: "hidden",
      configurable: true
    });
    document.dispatchEvent(new Event("visibilitychange"));
  }

  function show() {
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      configurable: true
    });
    document.dispatchEvent(new Event("visibilitychange"));
  }

  it("announces once when pagehide follows visibilitychange", () => {
    const element = mount(defineCommittingElement());
    const observed = observeDocument();
    const unbind = bindPageLifecycleCommit({ root: () => document.body });

    element.change("answer");
    hide();
    window.dispatchEvent(new Event("pagehide"));

    expect(observed.events.length).toEqual(1);

    unbind();
    observed.stop();
    show();
  });

  it("commits on pagehide with no preceding visibilitychange", () => {
    // iOS Safari can freeze a page on `pagehide` alone.
    const element = mount(defineCommittingElement());
    const observed = observeDocument();
    const unbind = bindPageLifecycleCommit({ root: () => document.body });

    element.change("answer");
    window.dispatchEvent(new Event("pagehide"));

    expect(observed.events.length).toEqual(1);

    unbind();
    observed.stop();
  });

  it("commits input that arrives between visibilitychange and pagehide", () => {
    const element = mount(defineCommittingElement());
    const observed = observeDocument();
    const unbind = bindPageLifecycleCommit({ root: () => document.body });

    element.change("answer");
    hide();
    element.change("a longer answer");
    window.dispatchEvent(new Event("pagehide"));

    expect(observed.events.length).toEqual(2);

    unbind();
    observed.stop();
    show();
  });

  it("commits again after the page comes back and the learner answers", () => {
    const element = mount(defineCommittingElement());
    const observed = observeDocument();
    const unbind = bindPageLifecycleCommit({ root: () => document.body });

    element.change("answer");
    hide();
    show();
    element.change("a longer answer");
    hide();

    expect(observed.events.length).toEqual(2);

    unbind();
    observed.stop();
    show();
  });

  it("runs onHidden after the commit", () => {
    const element = mount(defineCommittingElement());
    const reasons: string[] = [];
    const unbind = bindPageLifecycleCommit({
      root: () => document.body,
      onHidden: reason => reasons.push(reason)
    });

    element.change("answer");
    hide();

    expect(reasons).toEqual(["page-hidden"]);

    unbind();
    show();
  });

  it("stops committing after unbind", () => {
    const element = mount(defineCommittingElement());
    const observed = observeDocument();
    const unbind = bindPageLifecycleCommit({ root: () => document.body });
    unbind();

    element.change("answer");
    hide();
    window.dispatchEvent(new Event("pagehide"));

    expect(observed.events.length).toEqual(0);
    observed.stop();
    show();
  });
});

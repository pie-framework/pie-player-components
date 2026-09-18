/**
 * Final session commit at a player seam.
 *
 * A delivery element coalesces its `session-changed` dispatch, so a response the
 * learner finished entering can still be pending when the player is about to
 * discard the element. Losing it produces no event, which leaves a host with
 * nothing to detect.
 *
 * Reach, per seam:
 *
 * - `navigate` and `page-hidden` run while the elements are still attached, so
 *   the event reaches a `document`-level listener. Quiz Engine listens on
 *   `document`.
 * - `teardown` runs from `disconnectedCallback`, after removal. The event does
 *   not reach `document`, and Stencil has already removed the host's own
 *   `@Listen` handlers by then, so it does not reach an ancestor either. That
 *   is why `<pie-player>` decides its own save from a session signature
 *   rather than waiting to be told.
 *
 * Two paths, per element:
 *
 * - An element that owns its notification exposes `commitPendingSession()`, so
 *   it dispatches its own event with its own `complete` semantics. The sweep
 *   marks that event with `detail.sessionCommitReason`, which the element
 *   cannot do for itself and which every guard in a `session-changed`'s way
 *   keys on.
 * - An older element gets a synthesized `session-changed` built from its
 *   `session` getter. Those elements write the session synchronously and defer
 *   only the dispatch, so the read is never older than what the host was last
 *   told.
 *
 * Duplicated deliberately. The canonical implementation is
 * `commitPendingSessions` in `@pie-players/pie-players-shared`; keeping a copy
 * here costs a few lines and avoids adding a dependency on the go-forward
 * players to a package being migrated away from. Changes belong upstream first,
 * and this copy is kept by hand in the same order and shape as that file - apart
 * from the log prefix and the inlined predicate - so the two can be diffed by
 * eye. Nothing enforces it.
 */

/**
 * Commit hook a delivery element installs when it owns a deferred
 * `session-changed`. Owned by `@pie-element/shared-player-events`
 * (`createSessionNotifier`); the name is duplicated rather than imported so the
 * players carry no dependency on an element-repo package.
 */
export const SESSION_COMMIT_METHOD = "commitPendingSession";

/**
 * Where the last-observed session signature is recorded, on the element itself.
 *
 * On the element rather than in a module-scope map for two reasons: a nested
 * player stack loads two copies of this module from different bundles, and
 * module state would then let each layer announce the same commit; and a map
 * keyed by element records what the *sweep* last emitted, which suppresses a
 * later commit of a value the sweep emitted once before (answer A, hide, answer
 * B, answer A again, navigate mid-debounce - the host keeps B).
 *
 * `Symbol.for` so the two bundles resolve the same key.
 */
const OBSERVED_SIGNATURE = Symbol.for("pie.sessionCommit.observedSignature");

export type SessionCommitReason = "teardown" | "navigate" | "page-hidden";

export interface CommitPendingSessionsOptions {
  /** Recorded on a synthesized event as `detail.sessionCommitReason`. */
  reason?: SessionCommitReason;
}

export interface CommitPendingSessionsResult {
  /** Elements that committed their own pending notification. */
  committed: number;
  /** Elements for which the player synthesized a `session-changed`. */
  synthesized: number;
  /** Candidate elements with nothing new to commit. */
  skipped: number;
}

/**
 * Keys a delivery element carries on its session that are never learner input:
 * element identity, the dispatch metadata the event contract defines, and
 * presentation state a controller writes at load (choice shuffle order).
 */
const NON_RESPONSE_SESSION_KEYS = new Set([
  "id",
  "element",
  "complete",
  "component",
  "timestamp",
  "sourceRuntimeId",
  "shuffledValues",
]);

/**
 * `id` inside an array entry is the response - which hotspot, which choice.
 * `id` inside an object property that repeats the property's own name is
 * structure, which is how `explicit-constructed-response` and `ebsr` key their
 * parts. Distinguishing the two by container is what keeps an unanswered
 * `{ value: { partA: { id: "partA" } } }` from reading as a response.
 */
function carriesContent(value: unknown, owningKey?: string): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.some((entry) => carriesContent(entry));
  if (typeof value !== "object") return false;
  return Object.entries(value as Record<string, unknown>).some(
    ([key, nested]) => {
      if (key === "id" && owningKey !== undefined && nested === owningKey) {
        return false;
      }
      return carriesContent(nested, key);
    },
  );
}

/**
 * Whether an element session holds anything the learner put there.
 *
 * Shape-agnostic by necessity: `value` is one element's answer key, and
 * `response`, `selectedTokens`, `answers`, `answer`, `drawables` are others.
 * Anything outside the non-response key set with content in it counts, so an
 * element this function has never heard of is handled by default.
 *
 * This is the fallback discriminant for the session commit. The primary one is
 * a comparison against the session the player last observed, which needs no
 * schema knowledge at all; see `session-commit.ts`.
 */
export function hasLearnerResponse(session: unknown): boolean {
  if (!session || typeof session !== "object") return false;
  if (Array.isArray(session)) return session.some(hasLearnerResponse);
  return Object.entries(session as Record<string, unknown>).some(
    ([key, value]) =>
      !NON_RESPONSE_SESSION_KEYS.has(key) && carriesContent(value, key),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

/**
 * A PIE delivery element carries both halves of the element contract: a
 * `session` accessor and a `model` setter. Requiring both keeps the sweep off
 * player chrome and tool custom elements, and an element that has not been
 * upgraded yet has neither.
 */
function isPieDeliveryElement(element: Element): boolean {
  if (!element.tagName.includes("-")) return false;
  return "session" in element && "model" in element;
}

function shadowRootOf(node: unknown): ShadowRoot | null {
  const candidate = (node as { shadowRoot?: ShadowRoot | null } | null)
    ?.shadowRoot;
  return candidate ?? null;
}

function assignedElementsOf(element: Element): Element[] {
  const slot = element as HTMLSlotElement;
  if (typeof slot.assignedElements !== "function") return [];
  try {
    return slot.assignedElements({ flatten: true });
  } catch {
    return [];
  }
}

/**
 * Walks the flattened tree: `children`, then open shadow roots, then the
 * elements assigned to each `<slot>`.
 *
 * `querySelectorAll("*")` sees none of the last two, and both are load-bearing
 * here. The section player mounts each item inside `<pie-item-shell>`'s shadow
 * root, and projects its item pane through a slot on the assessment toolkit -
 * a walk that stops at `<slot>` finds every delivery element in a section
 * unreachable.
 */
function collectCandidates(
  root: ParentNode,
  seen: Set<Element>,
  out: Element[],
): void {
  const rootShadow = shadowRootOf(root);
  if (rootShadow) collectCandidates(rootShadow, seen, out);
  const visit = (element: Element) => {
    if (seen.has(element)) return;
    seen.add(element);
    if (isPieDeliveryElement(element)) out.push(element);
    collectCandidates(element, seen, out);
  };
  for (const assigned of assignedElementsOf(root as Element)) visit(assigned);
  const children = root.children;
  if (!children) return;
  for (const element of Array.from(children)) visit(element);
}

/**
 * Duck-typed rather than `instanceof Element`: the legacy players' test
 * environment is Stencil's mock DOM, where a mounted element is not an instance
 * of the global `Element`, and a check that silently fails there fails the same
 * way against any other DOM implementation a host brings.
 */
function isElementLike(node: unknown): node is Element {
  return (
    !!node &&
    typeof node === "object" &&
    typeof (node as Element).tagName === "string"
  );
}

function candidatesIn(root: ParentNode): Element[] {
  const candidates: Element[] = [];
  const seen = new Set<Element>();
  if (isElementLike(root) && isPieDeliveryElement(root)) {
    seen.add(root);
    candidates.push(root);
  }
  collectCandidates(root, seen, candidates);
  return candidates;
}

function readSession(element: Element): unknown {
  try {
    return (element as unknown as { session?: unknown }).session;
  } catch {
    // A getter that throws is not a session the player can commit.
    return undefined;
  }
}

function signatureOf(session: unknown): string | null {
  try {
    const json = JSON.stringify(session);
    // `JSON.stringify(undefined)` is `undefined`, which would be written as a
    // signature and then read back as "no baseline".
    return typeof json === "string" ? json : null;
  } catch {
    return null;
  }
}

function readObservedSignature(element: Element): string | undefined {
  const recorded = (element as unknown as Record<symbol, unknown>)[
    OBSERVED_SIGNATURE
  ];
  return typeof recorded === "string" ? recorded : undefined;
}

function writeObservedSignature(element: Element, signature: string): void {
  try {
    Object.defineProperty(element, OBSERVED_SIGNATURE, {
      value: signature,
      configurable: true,
      enumerable: false,
      writable: true,
    });
  } catch {
    // A frozen element cannot be marked. It then commits again on the next
    // seam, which a player's own session signature check absorbs.
  }
}

/**
 * Record an element's session as one the host has been told about.
 *
 * A player calls this from its `session-changed` listener, which is what makes
 * the commit's discriminant "has anything happened since the host last heard"
 * rather than a guess about an element's session schema.
 */
export function noteSessionObserved(target: EventTarget | null | undefined): void {
  if (!isElementLike(target)) return;
  const signature = signatureOf(readSession(target));
  if (signature === null) return;
  writeObservedSignature(target, signature);
}

/**
 * Seed the baseline for every delivery element in a subtree.
 *
 * A player calls this once its elements hold their loaded sessions, so a
 * restored response the learner has not touched is never announced as a change.
 */
export function noteSessionBaseline(
  root: ParentNode | null | undefined,
): void {
  if (!root) return;
  for (const element of candidatesIn(root)) {
    const signature = signatureOf(readSession(element));
    if (signature !== null) writeObservedSignature(element, signature);
  }
}

/**
 * Mark an element-owned commit's own event as a commit, for the length of the
 * sweep.
 *
 * `commitPendingSession()` lets the element dispatch its own `session-changed`,
 * with its own `complete` semantics, and that event carries no commit marker.
 * Every guard a player puts in a `session-changed`'s way keys on
 * `detail.sessionCommitReason` to let a commit through: this player's 150ms
 * model-set blocker, `pie-item-player`'s renderer dedupe, the section player's
 * cross-shell dedupe, `<pie-api-player>`'s save-now decision. Unmarked, an
 * element-owned commit is exactly the event those guards drop - and the
 * elements that adopted `createSessionNotifier` are the ones taking that path,
 * so the exemption applied to nothing.
 *
 * A capture listener on the sweep root runs before the target's own listeners
 * and before every bubble listener at or above the root, which is where all
 * four guards sit. Only the absent key is added; a synthesized event already
 * carries its own.
 */
function markCommitsDuring<T>(
  root: ParentNode,
  reason: SessionCommitReason,
  sweep: () => T,
): T {
  const target = root as unknown as EventTarget;
  if (typeof target.addEventListener !== "function") return sweep();
  const stamp = (event: Event) => {
    const detail = (event as CustomEvent).detail;
    if (!isRecord(detail) || "sessionCommitReason" in detail) return;
    try {
      (detail as Record<string, unknown>).sessionCommitReason = reason;
    } catch {
      // A frozen detail keeps its own contract; the commit still dispatches.
    }
  };
  target.addEventListener("session-changed", stamp, true);
  try {
    return sweep();
  } finally {
    target.removeEventListener("session-changed", stamp, true);
  }
}

export function commitPendingSessions(
  root: ParentNode | null | undefined,
  options: CommitPendingSessionsOptions = {},
): CommitPendingSessionsResult {
  const result: CommitPendingSessionsResult = {
    committed: 0,
    synthesized: 0,
    skipped: 0,
  };
  if (!root) return result;
  return markCommitsDuring(root, options.reason ?? "teardown", () =>
    sweepPendingSessions(root, options, result),
  );
}

function sweepPendingSessions(
  root: ParentNode,
  options: CommitPendingSessionsOptions,
  result: CommitPendingSessionsResult,
): CommitPendingSessionsResult {
  for (const element of candidatesIn(root)) {
    const session = readSession(element);
    if (!isRecord(session)) {
      result.skipped += 1;
      continue;
    }
    const signature = signatureOf(session);
    if (signature === null) {
      result.skipped += 1;
      continue;
    }

    const observed = readObservedSignature(element);
    if (observed === signature) {
      // The host already has this. Nothing is pending, whichever path the
      // element would have taken.
      result.skipped += 1;
      continue;
    }
    if (observed === undefined && !hasLearnerResponse(session)) {
      // No baseline, so the player never saw this element load - the section
      // player's shells and the legacy Stencil stack both have paths where
      // that happens. Announcing an untouched element's identity-only session
      // makes a host that re-renders on `session-changed` cancel work it was
      // in the middle of: a config swap re-pushed the host's own config and
      // discarded the incoming item.
      result.skipped += 1;
      continue;
    }

    const commit = (element as unknown as Record<string, unknown>)[
      SESSION_COMMIT_METHOD
    ];
    if (typeof commit === "function") {
      // An element's own commit is a no-op when nothing is pending, and its
      // session can still differ from what the host heard: a controller writing
      // into the session, or an element path that stores a value without
      // notifying. Counting the call as the announcement recorded a response the
      // host never received and every later seam then skipped it, so what the
      // element dispatches is what counts. `flush()` is synchronous in every
      // implementation of this contract; one that deferred would be announced
      // twice, which a player's signature check absorbs.
      let dispatched = false;
      const witness = () => {
        dispatched = true;
      };
      element.addEventListener("session-changed", witness, true);
      let failed = false;
      try {
        (commit as () => void).call(element);
      } catch (error) {
        failed = true;
        console.warn(
          `[pie-player] ${element.tagName.toLowerCase()} failed to commit its pending session`,
          error,
        );
      } finally {
        element.removeEventListener("session-changed", witness, true);
      }
      if (failed) {
        result.skipped += 1;
        continue;
      }
      if (dispatched) {
        writeObservedSignature(element, signature);
        result.committed += 1;
        continue;
      }
      // Nothing was pending, so fall through and announce the session the
      // element holds.
    }

    try {
      element.dispatchEvent(
        new CustomEvent("session-changed", {
          bubbles: true,
          composed: true,
          detail: {
            component: element.tagName.toLowerCase(),
            session: JSON.parse(signature),
            sessionCommitReason: options.reason ?? "teardown",
          },
        }),
      );
      writeObservedSignature(element, signature);
      result.synthesized += 1;
    } catch (error) {
      console.warn(
        `[pie-player] ${element.tagName.toLowerCase()} session commit dispatch failed`,
        error,
      );
      result.skipped += 1;
    }
  }

  return result;
}

export interface BindPageLifecycleCommitOptions {
  /**
   * The subtree to commit, re-evaluated on every transition: a player's
   * container is replaced during its lifetime.
   */
  root: () => ParentNode | null | undefined;
  /**
   * Runs after the synchronous commit, for a player that owns a backend save.
   * A hidden document only performs synchronous work dependably, so a save
   * started here needs `keepalive`.
   */
  onHidden?: (reason: SessionCommitReason) => void;
}

/**
 * Commit on the page going away rather than on the player being removed from it.
 *
 * `visibilitychange` to `hidden` is the primary signal: it is the last event a
 * mobile browser reliably delivers before freezing or discarding a page.
 * `pagehide` backs it up for same-document navigation and back/forward cache
 * entry, and for iOS Safari, which can fire it without a preceding
 * `visibilitychange`. Both fire on an ordinary navigation; the per-element
 * baseline makes the second a no-op, and input arriving between them is still
 * committed - which a "commit once per hidden transition" guard would drop.
 * `beforeunload` is not used: it is unreliable on mobile and costs the
 * back/forward cache.
 *
 * Returns an unbind function. Safe to call outside a browser, where it binds
 * nothing.
 */
export function bindPageLifecycleCommit(
  options: BindPageLifecycleCommitOptions,
): () => void {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return () => {};
  }

  const commit = (reason: SessionCommitReason) => {
    commitPendingSessions(options.root(), { reason });
    try {
      options.onHidden?.(reason);
    } catch (error) {
      console.warn("[pie-player] onHidden failed", error);
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") commit("page-hidden");
  };

  const handlePageHide = () => {
    commit("page-hidden");
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pagehide", handlePageHide);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("pagehide", handlePageHide);
  };
}

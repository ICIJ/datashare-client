# Code review — branch fix/oversized-markdown-pages (high)

Range: main (ec72887e6) .. fdb25fcf0. 8 finder angles, deduplicated and verified.
Ordered by severity. CONFIRMED = mechanism verified in code; PLAUSIBLE = needs a browser/build check.

## High

### 1. A silently killed worker leaves an infinite spinner with no escape (CONFIRMED)
`src/utils/markdown.js:296-306`, `src/components/Document/DocumentContentMarkdown.vue` (loadPage)
The render promise settles only on `message` or `error`. There is no `onmessageerror` handler, no timeout, and no cleanup on unmount or page change. Chrome does not guarantee an `error` event when it kills a worker for exceeding its memory cap — which is precisely the oversized render-anyway path. The promise never settles, `loading` stays true forever, and the retry/plain-text buttons are unreachable (they live under the error branch). Fix: wire `onmessageerror` to the same rejection path, and/or add a render timeout.

### 2. The viewer tab still renders whole markdown files on the main thread (CONFIRMED)
`src/components/Document/DocumentViewer/DocumentViewerMarkdown.vue:38`
The other `renderMarkdown` caller renders an entire unpaginated `.md` file with no threshold, no fallback, no `content-visibility`. The branch's stated bug (huge markdown freezes the tab) still reproduces there, arguably worse. Switching to `renderMarkdownOffThread` is a one-word change; a size guard would need its own design. Fixing this also unlocks moving the worker glue to its own module so the unified stack ships only in the worker chunk (today the viewer pins it in the main bundle).

## Medium

### 3. Worker construction failure rejects every page instead of falling back inline (CONFIRMED)
`src/utils/markdown.js:302-305`
`typeof Worker === 'undefined'` is the only fallback guard. Under a CSP without `worker-src 'self'`, or a browser without module workers, `new Worker(...)` throws synchronously inside the promise executor: every formatted page shows the error alert although the functional inline `renderMarkdown` exists. Secondary: `pendingRenders.set(id, ...)` runs before the throw, orphaning the entry. Fix: try/catch around `getWorker().postMessage(...)` that deletes the entry and falls back to `renderMarkdown(source)`.

### 4. Unguarded `new URL(base).host` can fail a whole document render (CONFIRMED, latent)
`src/utils/markdown.js:65` (and default at `:244`)
The old code (`window.location.host`) could never throw; the new eager parse throws `TypeError: Invalid URL` for `base: ''`/`null` (destructuring defaults only fire on `undefined`), failing the entire document — the exact failure mode the `resolveHref` comment 20 lines above exists to prevent. Also: `renderMarkdown`'s `window.location.href` default is unreachable inside the worker (no `window`); a future worker-side call without `base` would `ReferenceError`. Fix: `URL.canParse(base)` guard degrading to no-unwrap, and `globalThis.location?.href` as the default.

### 5. The render-anyway escape hatch leads back into the freeze via main-thread marking (CONFIRMED)
`src/components/Document/DocumentContentMarkdown.vue:89-100`, `src/utils/strings.js:170-190`
`markedHtml` runs `addSearchMarksClassInHtml` — a full `DOMParser` parse + walk + `innerHTML` serialize — once for the local term plus once per global term, synchronously, on every term change. The plan accepted this as bounded by the ceiling, but `renderOversized: true` removes the bound: a reader who insists on a huge page gets multi-MB×4 parse/serialize round-trips per search keystroke. Fix direction: apply all terms in one parse, or move marking into the worker alongside the render.

### 6. One "render anyway" disables the guard for the rest of the document (CONFIRMED, design tradeoff)
`src/components/Document/DocumentContent.vue:70, 317-323`
`markdownOversized` latches per document and feeds `renderOversized` for every page: consenting to a 600 KB page 3 silently bypasses the check on a 40 MB page 7, and the "may be slow" hint stays pinned on pages that render instantly. Per-page consent (reset on page change) would preserve the intent.

### 7. `contain-intrinsic-size: auto 300px` on every block can mis-land match/anchor jumps (PLAUSIBLE — browser check needed)
`src/components/Document/DocumentContentMarkdown.vue:284-293`
`scrollIntoView` renders its target, but the blocks above it are still 300 px placeholders on first jump; real heights resolve afterwards and shift the highlighted match off-screen (`activateMatch`, `useMarkdownAnchors`). `content-visibility: auto` also implies paint containment, which may clip wide overflowing tables. The plan already flags manual browser verification for this task — test match navigation on a long page specifically; `contain-intrinsic-size: auto none`, or scoping the rule to `> table, > pre`, are the fallbacks.

## Low

### 8. A late error event from a replaced worker can terminate the healthy one (CONFIRMED, unlikely)
`src/utils/markdown.js:270-278`
`onWorkerError` acts on the module-global `worker`: a second queued error from a terminated worker either throws on `null.terminate()` or terminates the fresh replacement and rejects its in-flight renders. Fix: identity-check the event target (or guard `worker !== null` / detach handlers before terminate).

### 9. Oversized payload re-downloaded on every Formatted↔Plain toggle (CONFIRMED)
`src/components/Document/DocumentContent.vue:677` (v-if) + `DocumentContentMarkdown.vue:171`
The oversized fetch is deliberately uncached and the component cache dies with the `v-if` unmount, so the documented happy path costs two full downloads, and every later toggle re-fetches and re-renders every page. Hoisting the cache to module scope (keyed `doc:page`) or `v-show`/`keep-alive` would fix it.

### 10. A stale in-flight render re-populates the cache after the document-switch clear (CONFIRMED, bounded)
`src/components/Document/DocumentContentMarkdown.vue:174`
The cache write happens unconditionally after the await; the doc-swap clear can be followed by the abandoned render writing one unreachable entry (evicted at the next swap). Guard the write with the `lastPageLoad` counter.

### 11. `markdown.length` dereferences the payload before any null guard (PLAUSIBLE)
`src/components/Document/DocumentContentMarkdown.vue:171`
`renderMarkdown`'s `if (!source)` used to absorb a null/undefined API payload; the new threshold check throws on it first, turning a formerly-empty page into an error alert. `(markdown?.length ?? 0)` restores the old behavior.

### 12. Worker chunk built as IIFE but instantiated with `{ type: 'module' }` (PLAUSIBLE)
`src/utils/markdown.js:282`, `vite.config.js` (no `worker.format`)
Vite's default `worker.format` is `'iife'`; the build works today and the graph has no dynamic imports, but format and type disagree, and jsdom tests never execute the real worker path. Set `worker: { format: 'es' }` or verify the production chunk in a browser once.

### 13. Em dash in the `renderOversized` prop docstring (CONFIRMED — your no-em-dash rule)
`src/components/Document/DocumentContentMarkdown.vue:60`
The only em dash in the branch diff.

### 14. `oversizedThreshold` prop is a test seam, not a real knob (CONFIRMED)
`src/components/Document/DocumentContentMarkdown.vue:51-58`
No production caller sets it; the repo keeps this class of constant in `src/utils/settings.js`. Moving it there (keeping a test override path) matches convention and prevents two embeds from disagreeing about "oversized".

## Follow-up worth considering (not findings)

- Profile a real 500 KB page with only the worker + `content-visibility` active. If usable, the whole threshold state machine (2 props, 1 emit, parent latch, dropdown hint) could be deleted; if not, the profile will show the remaining cost is the marking pass (finding 5).
- The three parallel "go to plain text" channels (`fallback`/`empty`/`oversized`, each with its own ref/handler/reset) could collapse into one `fallback(reason)` emit over a single `markdownFallbackReason` ref.

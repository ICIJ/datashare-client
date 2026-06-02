# Storybook `$core` + MSW mocking — design

Date: 2026-06-02
Status: Approved (pending spec review)

## Problem

A large set of Storybook stories render an error instead of the component
(see the tracked list in the originating request — `core-api--docs`,
`BatchSearchCard`, `DisplayUser`, the whole `DocumentUser*` family,
`EmptyState`, `AppIcon`, `ProjectRow`, etc.).

The failure has **two distinct root causes**, not one:

1. **Missing `$core` (primary).** Every failing component calls
   `useCore()` (`src/composables/useCore.js`), which returns
   `proxy.$core`. In the real app, `$core` is a Vue global installed by the
   Core plugin (`src/core/Core.js:217`, via `buildCorePlugin()`/`useCore()`).
   But `.storybook/preview.js` only installs bootstrap-vue-next, vue-i18n and
   vue3-toastify by hand — **`$core` is never provided**. So `useCore()`
   returns `undefined` and the component throws on mount (`core.auth`,
   `core.api.*`, pipeline stores, …) before any network call happens. This is
   why these specific stories fail while the 150+ purely-presentational
   stories render fine.

2. **No backend (secondary).** Components that get past mount issue HTTP
   requests through the real `apiInstance` (axios, `src/api/index.js` →
   `sendAction` → `Api.getFullUrl`) and the `elasticsearch-browser` client
   (`src/api/elasticsearch.js`, host `…/api/index/search`). In Storybook
   there is no server, so those requests fail.

Mock Service Worker (MSW) cleanly solves #2. #1 must be solved separately by
providing a faithful `$core` to the Storybook app. The two fixes compose: once
a real `$core` exists, its `api`/`elasticsearch` clients make their normal
requests and MSW intercepts them.

## Goals

- Make the failing stories render without errors **and** show realistic
  mocked data (comments, recommendations, tags, users, batch searches,
  document cards).
- Solution must be **DRY and maintainable**: one source of truth for core
  setup, one handler/fixture module per resource, declarative per-story
  overrides.
- No changes to application/runtime code — everything lives under
  `.storybook/` and dev-dependencies.
- Works in the statically published Storybook on GitHub Pages
  (`https://icij.github.io/datashare-client/`).

## Non-goals (YAGNI)

- Mocking the entire ~91-method API surface. Mock only the endpoints the
  failing stories hit at boot or on render; add more when a new story needs
  one.
- Per-query Elasticsearch response bodies. One representative `_search`
  result fixture, reused across document-card stories.
- Refactoring unrelated stories or components.

## Architecture — two composing layers

### Layer A — faithful `$core` (fixes the throws)

Replace the hand-rolled i18n/bootstrap/toastify setup in
`.storybook/preview.js` with a Storybook Core built from the real `Core`
class, mirroring `tests/unit/CoreSetup.js`. A thin `StorybookCore` subclass
becomes the single source of truth and installs i18n, bootstrap-vue-next,
murmur, pinia, router, toastify **and** the `$core` global exactly as the app
does.

- Reuses the real `Core` machinery (decision: "Reuse real Core machinery"),
  so Storybook stays faithful to production behaviour and there is one setup
  to maintain.
- Must avoid double-installing plugins: the new `withCore` decorator owns the
  full plugin install; the current inline `setup((app) => …)` block in
  `preview.js` that installs bootstrap/i18n/toastify is removed.
- The existing `withPinia` decorator (`.storybook/decorators/pinia.js`) and
  inline i18n setup are subsumed by `StorybookCore`; the `withMurmur`
  decorator is reconciled (murmur is installed by the core, matching
  `CoreSetup`).
- The router is provided by the core (stories already using
  `storybook-vue3-router` continue to work; the core router covers the rest).

### Layer B — MSW (fixes the network)

Add `msw` and `msw-storybook-addon` as dev-dependencies. The real
`apiInstance` (axios) and `elasticsearch-browser` client keep issuing their
normal requests; MSW intercepts them at the XHR/fetch boundary and replies
with fixtures. Requests are matched by **path** (`*/api/...`,
`*/api/index/search/...`) so the GH Pages origin (`icij.github.io`) is
irrelevant.

## Module layout (new files)

```
.storybook/
  decorators/
    core.js          # withCore: builds StorybookCore once (memoized), installs $core
                     #   replaces the inline setup + withPinia + withMurmur wiring
  msw/
    handlers.js      # `defaultHandlers`: flattens the per-resource modules
    handlers/
      settings.js    # GET /api/settings, /api/config            (boot)
      auth.js        # GET /api/users/me, /api/users/me/permissions (boot)
      documents.js   # ES _search, document-user-* (comments, tags, recommendations)
      batchSearch.js # /api/batch/search...
      projects.js    # /api/project...
    fixtures/        # plain JSON/JS fixtures, one file per resource
    helpers.js       # emptyJson(pattern, method?), errorJson(pattern, status?)
    browser.js       # initialize() from msw-storybook-addon + worker options
  static/
    mockServiceWorker.js   # generated by `npx msw init`; served via existing staticDirs
```

`.storybook/preview.js` shrinks to:

- `loaders: [mswLoader]`
- global decorators: `withCore` + the existing theme + v-model decorators
- `parameters.msw.handlers = defaultHandlers`

## Data flow

- **Boot (every story):** `withCore` instantiates `StorybookCore` once
  (memoized across stories) → `core.configure()` fires `getSettings` /
  `getUser` → MSW default handlers reply → `core.ready` resolves → the story
  renders with real config and mocked data.
- **Per-story override (DRY escape hatch):** a story sets
  `parameters.msw.handlers` to override only the endpoints it cares about.
  The addon merges these over the global defaults, so each story declares only
  its delta.

## Fixture & handler organization (the DRY core)

**One resource → one handler module → one fixture file.** Each module in
`msw/handlers/` exports an array of MSW handlers; `handlers.js` flattens them
into `defaultHandlers`. Fixtures live beside them as plain data.

```js
// .storybook/msw/handlers/documents.js
import { http, HttpResponse } from 'msw'
import comments from '../fixtures/comments.json'
import recommendations from '../fixtures/recommendations.json'

export default [
  http.get('*/api/document-user-recommendation/', () => HttpResponse.json(recommendations)),
  http.get('*/api/:project/documents/comments/*', () => HttpResponse.json(comments))
  // ...
]
```

```js
// .storybook/msw/handlers.js
import settings from './handlers/settings'
import auth from './handlers/auth'
import documents from './handlers/documents'
// ...
export const defaultHandlers = [...settings, ...auth, ...documents /* , ... */]
```

**Two helpers keep story overrides declarative:**

- `emptyJson(pattern, method = 'get')` — returns an empty-collection handler
  for `--no-results` / empty-state variants.
- `errorJson(pattern, status = 500)` — for `--error` variants.

```js
// BatchSearchCard.stories.js
export const NoResults = {
  parameters: { msw: { handlers: [emptyJson('*/api/batch/search/*')] } }
}
```

**Fixtures sourced from real shapes.** Fixture JSON is derived from the
response shapes the unit tests already assert against (`tests/unit/...`) and
the `src/api/resources/*` definitions, so mocks stay faithful to the real
contract. Fixtures are the only thing most contributors will need to touch.

## GitHub Pages / static build

- `npx msw init .storybook/static/ --save` generates `mockServiceWorker.js`
  into the existing `staticDirs`, so it ships with `storybook build`.
- The worker is initialized with `onUnhandledRequest: 'bypass'` (unmocked
  assets/fonts pass through) and a `serviceWorker.url` that respects
  Storybook's base path on Pages (`/datashare-client/`).
- The `mswLoader` ensures the worker is ready before each story renders.
- `import.meta.env.VITE_DS_HOST` / `VITE_ES_HOST` stay unset in Storybook, so
  URLs resolve against `window.location` and match the path-based handlers.

## Error states & verification

- For data components, add a small number of **state variants** as stories
  (`--with-comments`, `--no-results`, `--error`) using the override helpers.
  These both document the states and exercise the override path.
- **Verification:**
  1. `yarn doc:storybook` (build) succeeds.
  2. A Playwright pass over a representative sample of the previously-failing
     story URLs confirms no error overlay and that mocked content renders.
     Spot-check at least: `core-api--docs`, `BatchSearchCard`, `DisplayUser`,
     `DocumentUserComments`, `DocumentUserRecommendations`,
     `DocumentUserTags`, `EmptyState`, `AppIcon`.

## Risks & mitigations

- **Double plugin install / boot order.** `withCore` must fully own plugin
  installation; remove the inline `setup()` install and the now-redundant
  `withPinia`/`withMurmur` wiring. Mitigation: model `StorybookCore` on
  `tests/unit/CoreSetup.js`, which already composes these correctly.
- **`core.ready` never resolves if a boot endpoint is unmocked.** Mitigation:
  `settings.js` + `auth.js` handlers are part of the default set and covered
  by the build/Playwright verification; `onUnhandledRequest: 'bypass'` plus a
  dev-time log surfaces any missed endpoint.
- **GH Pages base-path / service-worker scope.** Mitigation: explicit
  `serviceWorker.url` honoring the Storybook base path; verified against the
  built static output, not just dev mode.
- **ES `_search` fixture drift.** Mitigation: single representative fixture
  derived from test assertions; scoped as a non-goal to track per-query
  bodies.

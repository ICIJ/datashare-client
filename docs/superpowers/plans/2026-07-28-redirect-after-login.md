# Redirect After Login (Server Mode) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After logging in (form auth or OAuth) in server mode, the user lands on the deep link they originally requested — including query string and hash — instead of the default page.

**Architecture:** The existing `redirectAfterLogin` mechanism (app Pinia store, persisted to localStorage, popped by the router guard on the first authenticated navigation) is kept as the single carrier. The fix is in the *capture* side: the boot-401 path in `main.js` (extracted into a testable `handleBootFailure` helper) stores the requested URL before navigating to login; the router guard stores `to.fullPath` instead of `to.path`; and the auth guard runs before the role guard so unauthenticated users on role-protected routes reach login instead of the error page. The store setter sanitizes values (must start with `/`, never `/login`).

**Tech Stack:** Vue 3, Vue Router 4, Pinia (pinia-plugin-persistedstate), Vitest + Vue Test Utils.

**Spec:** `docs/superpowers/specs/2026-07-28-redirect-after-login-design.md`

## Global Constraints

- Client-only fix; no backend change.
- No expiry/TTL for the stored redirect; pop-on-first-authenticated-navigation semantics unchanged.
- No behavior change in LOCAL/EMBEDDED modes.
- Commits: conventional, subject line only, no body, never co-authored (user rule).
- `docs/superpowers/` is gitignored in this repo — never commit spec/plan files.
- Run tests with `yarn test:unit <file>` (this runs `vitest --run`).

---

### Task 1: Sanitize `setRedirectAfterLogin` in the app store

**Files:**
- Modify: `src/store/modules/app.js:182-186`
- Test: `tests/unit/specs/store/modules/app.spec.js`

**Interfaces:**
- Produces: `setRedirectAfterLogin(path)` — stores `path` when it is a string starting with `/` but not `/login`; clears to `null` when `path` is falsy; ignores anything else. `popRedirectAfterLogin()` unchanged: returns the stored value (or `null`) and clears it. Tasks 2 and 4 rely on exactly these semantics.

- [ ] **Step 1: Write the failing tests**

Add to `tests/unit/specs/store/modules/app.spec.js`, inside the top-level `describe('AppStore', ...)` block (the `beforeEach` already creates a fresh store as `store`):

```js
describe('redirectAfterLogin', () => {
  it('should be null initially', () => {
    expect(store.redirectAfterLogin).toBeNull()
  })

  it('setRedirectAfterLogin should store a path starting with a slash', () => {
    store.setRedirectAfterLogin('/settings/appearance')
    expect(store.redirectAfterLogin).toBe('/settings/appearance')
  })

  it('setRedirectAfterLogin should store a full path with query and hash', () => {
    store.setRedirectAfterLogin('/settings?foo=bar#appearance')
    expect(store.redirectAfterLogin).toBe('/settings?foo=bar#appearance')
  })

  it('setRedirectAfterLogin should ignore the login page', () => {
    store.setRedirectAfterLogin('/settings')
    store.setRedirectAfterLogin('/login')
    expect(store.redirectAfterLogin).toBe('/settings')
  })

  it('setRedirectAfterLogin should ignore values not starting with a slash', () => {
    store.setRedirectAfterLogin('/settings')
    store.setRedirectAfterLogin('https://evil.example.com/')
    expect(store.redirectAfterLogin).toBe('/settings')
  })

  it('setRedirectAfterLogin should clear the value when passed null', () => {
    store.setRedirectAfterLogin('/settings')
    store.setRedirectAfterLogin(null)
    expect(store.redirectAfterLogin).toBeNull()
  })

  it('popRedirectAfterLogin should return the value and clear it', () => {
    store.setRedirectAfterLogin('/settings?foo=bar')
    expect(store.popRedirectAfterLogin()).toBe('/settings?foo=bar')
    expect(store.redirectAfterLogin).toBeNull()
  })

  it('popRedirectAfterLogin should return null when nothing is stored', () => {
    expect(store.popRedirectAfterLogin()).toBeNull()
  })
})
```

- [ ] **Step 2: Run the tests to verify the new ones fail**

Run: `yarn test:unit tests/unit/specs/store/modules/app.spec.js`
Expected: the "ignore values not starting with a slash" test FAILS (current setter stores any non-`/login` string). The others may pass — that's fine; the failing one proves the sanitizer is missing.

- [ ] **Step 3: Implement the sanitizer**

In `src/store/modules/app.js`, replace the current `setRedirectAfterLogin`:

```js
    /**
     * Sets the redirect path to be used after login. Only relative paths
     * (starting with `/`) are accepted, and never the login page itself.
     * Passing a falsy value clears the stored path.
     *
     * @param {string|null} [path=null] - Redirect path.
     */
    const setRedirectAfterLogin = (path = null) => {
      if (!path) {
        redirectAfterLogin.value = null
      }
      else if (path.startsWith('/') && !path.startsWith('/login')) {
        redirectAfterLogin.value = path
      }
    }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/store/modules/app.spec.js`
Expected: PASS (all).

- [ ] **Step 5: Commit**

```bash
git add src/store/modules/app.js tests/unit/specs/store/modules/app.spec.js
git commit -m "fix(store): only accept relative paths as redirect after login"
```

---

### Task 2: Store and restore the full path (query + hash) in the router guard

**Files:**
- Modify: `src/router/guards/index.js:38-65` (`proceedAuthenticated`, `proceedUnauthenticated`)
- Test: `tests/unit/specs/router/guards.spec.js`

**Interfaces:**
- Consumes: `setRedirectAfterLogin(path)` / `popRedirectAfterLogin()` from Task 1 (string fullPath or null).
- Produces: unauthenticated navigation stores `to.fullPath`; the first authenticated navigation calls `next(path)` with that fullPath string, restoring query and hash.

- [ ] **Step 1: Write the failing tests**

In `tests/unit/specs/router/guards.spec.js`:

Inside `describe('when the user is not authenticated', ...)` (its `beforeEach` already resets auth and rejects `api.getUser`), add:

```js
      it('should store the full path including query and hash before redirecting to login', async () => {
        removeCookie(process.env.VITE_DS_COOKIE_NAME)
        const appStore = useAppStore()
        appStore.setRedirectAfterLogin(null)
        await router.push({ path: '/settings', query: { foo: 'bar' }, hash: '#appearance' })
        expect(router.currentRoute.value.name).toBe('login')
        expect(appStore.redirectAfterLogin).toBe('/settings?foo=bar#appearance')
      })
```

Inside `describe('when the user is authenticated', ...)`, add:

```js
      it('should restore query and hash of the stored path after login', async () => {
        setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'yolo' }, JSON.stringify)
        const appStore = useAppStore()
        appStore.setRedirectAfterLogin('/settings?foo=bar#appearance')
        await router.push({ name: 'project.list' })
        expect(router.currentRoute.value.fullPath).toBe('/settings?foo=bar#appearance')
      })
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/router/guards.spec.js`
Expected: the first new test FAILS (stored value is `/settings`, without query and hash). The second new test FAILS (restored route's fullPath is `/settings?foo=bar#appearance` only if the guard passes the full string through — currently it does `next({ path })`, which drops query and hash).

- [ ] **Step 3: Implement fullPath store and restore**

In `src/router/guards/index.js`, update the two helpers:

```js
  /**
   * Handles navigation for an authenticated user. If a redirect was stored
   * before login, navigates there instead of the original target.
   * @param {import('vue-router').RouteLocationNormalized} to
   * @param {import('vue-router').NavigationGuardNext} next
   */
  function proceedAuthenticated(to, next) {
    const appStore = useAppStore()
    const path = appStore.popRedirectAfterLogin()
    if (path !== null && to.fullPath !== path) {
      next(path)
    }
    else {
      next()
    }
  }
```

```js
  function proceedUnauthenticated(to, from, next) {
    const appStore = useAppStore()
    if (from.name !== 'login' && to.name !== 'login') {
      appStore.setRedirectAfterLogin(to.fullPath)
      next({ name: 'login' })
    }
    else {
      next()
    }
  }
```

Note: `next(path)` with a string is parsed by vue-router as a full location (path + query + hash), unlike `next({ path })` which treats query and hash as absent. The only changes are `to.path` → `to.fullPath`, the explicit `path !== null` check, and `next({ path })` → `next(path)`; keep the JSDoc comments as they are.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/router/guards.spec.js`
Expected: PASS, including the pre-existing "should redirect to stored path after login" test.

- [ ] **Step 5: Commit**

```bash
git add src/router/guards/index.js tests/unit/specs/router/guards.spec.js
git commit -m "fix(router): preserve query and hash in redirect after login"
```

---

### Task 3: Run the auth guard before the role guard

**Files:**
- Modify: `src/router/guards/index.js:234-237` (guard registration order)
- Test: `tests/unit/specs/router/guards.spec.js`

**Interfaces:**
- Consumes: guard helpers from Task 2 (unchanged here; only registration order moves).
- Produces: unauthenticated users hitting role-protected routes are redirected to `login` (with the destination stored), not to the `error` page. Authenticated users still get role-checked before the route renders.

- [ ] **Step 1: Write the failing test**

In `tests/unit/specs/router/guards.spec.js`, inside `describe('checkUserRole', ...)`, add:

```js
    it('should redirect an unauthenticated user to login instead of error', async () => {
      removeCookie(process.env.VITE_DS_COOKIE_NAME)
      auth.reset()
      api.getUser.mockRejectedValue()
      config.set('policies', [])
      const appStore = useAppStore()
      appStore.setRedirectAfterLogin(null)
      await router.push({ name: 'project.view.edit', params: { name: 'local-datashare' } })
      expect(router.currentRoute.value.name).toBe('login')
      expect(appStore.redirectAfterLogin).toContain('/local-datashare/')
    })
```

Note: the `checkUserRole` `beforeEach` sets an auth cookie — this test removes it and resets auth first, so the user is unauthenticated.

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test:unit tests/unit/specs/router/guards.spec.js`
Expected: the new test FAILS with `currentRoute.name` being `'error'` (the role guard runs first, finds no policy, and denies with "not found" before the auth guard can redirect to login).

- [ ] **Step 3: Reorder guard registration**

In `src/router/guards/index.js`, change the registration block at the bottom to:

```js
  router.beforeEach(checkMode)
  router.beforeEach(checkUserAuthentication)
  router.beforeEach(checkUserRole)
  router.beforeEach(checkUserProjects)
  router.beforeEach(preparePageContext)
  router.beforeEach(startProgress)
  router.afterEach(endProgress)
```

(Only `checkUserAuthentication` and `checkUserRole` swap places.)

- [ ] **Step 4: Run the full guard suite to verify it passes**

Run: `yarn test:unit tests/unit/specs/router/guards.spec.js`
Expected: PASS — the new test and all pre-existing `checkUserRole` tests (they set an auth cookie, so the auth guard passes through and role checks behave as before).

- [ ] **Step 5: Commit**

```bash
git add src/router/guards/index.js tests/unit/specs/router/guards.spec.js
git commit -m "fix(router): check authentication before user role in guards"
```

---

### Task 4: Capture the requested URL on boot failure (401)

**Files:**
- Create: `src/core/handleBootFailure.js`
- Modify: `src/main.js`
- Test: `tests/unit/specs/core/handleBootFailure.spec.js` (create)

**Interfaces:**
- Consumes: `setRedirectAfterLogin(path)` from Task 1; `core.pinia`, `core.auth.reset()`, `core.useRouter()`, `core.router` from `Core`.
- Produces: `handleBootFailure(core, error)` — mounts the app; on a 401 stores `location.pathname + location.search + location.hash`, resets auth, and pushes `{ name: 'login' }`; otherwise pushes `{ name: 'error', state: { error } }`. `main.js` calls it from the `datashare.ready` catch.

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/specs/core/handleBootFailure.spec.js`:

```js
import { flushPromises } from '@vue/test-utils'

import { createCore } from '@/core'
import { handleBootFailure } from '@/core/handleBootFailure'
import { useAppStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    getUser: vi.fn(),
    getSettings: vi.fn().mockResolvedValue({}),
    getProject: vi.fn().mockResolvedValue({})
  }
}))

describe('handleBootFailure', () => {
  let core

  beforeEach(() => {
    const app = document.createElement('div')
    app.setAttribute('id', 'app')
    document.body.appendChild(app)
    api.getUser.mockRejectedValue({ response: { status: 401 } })
    core = createCore()
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    document.querySelectorAll('#app').forEach(el => el.remove())
    vi.clearAllMocks()
  })

  it('should store the requested URL and redirect to login on a 401', async () => {
    window.history.replaceState({}, '', '/settings?foo=bar#appearance')
    handleBootFailure(core, { response: { status: 401 } })
    await flushPromises()
    const appStore = useAppStore(core.pinia)
    expect(appStore.redirectAfterLogin).toBe('/settings?foo=bar#appearance')
    expect(core.router.currentRoute.value.name).toBe('login')
  })

  it('should redirect to the error page on a non-401 failure', async () => {
    handleBootFailure(core, new Error('boom'))
    await flushPromises()
    expect(core.router.currentRoute.value.name).toBe('error')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `yarn test:unit tests/unit/specs/core/handleBootFailure.spec.js`
Expected: FAIL — `handleBootFailure` module does not exist yet.

- [ ] **Step 3: Implement the handler and rewire main.js**

Create `src/core/handleBootFailure.js`:

```js
import { useAppStore } from '@/store/modules'

/**
 * Handles a failed core boot sequence. On a 401 (unauthenticated in server
 * mode), stores the URL the user originally requested so the router guard
 * can restore it after login, then redirects to the login page. Any other
 * error redirects to the error page.
 * @param {import('@/core/Core').default} core - The core instance whose `ready` promise rejected.
 * @param {Error} error - The boot error.
 */
export function handleBootFailure(core, error) {
  const unauthorized = error?.response?.status === 401
  if (unauthorized) {
    const { pathname, search, hash } = window.location
    useAppStore(core.pinia).setRedirectAfterLogin(pathname + search + hash)
    core.auth.reset()
  }
  core.useRouter().mount()
  if (unauthorized) {
    core.router.push({ name: 'login' })
  }
  else {
    core.router.push({ name: 'error', state: { error } })
  }
}
```

Replace `src/main.js` with:

```js
import '@/main.scss'
import '@/utils/shared'
import { createCore } from '@/core'
import { handleBootFailure } from '@/core/handleBootFailure'

if (import.meta.env.MODE !== 'test' && window) {
  const datashare = createCore()
  // Mount the core when it's ready
  datashare.ready
    // Everything is fine
    .then(() => datashare.useRouter().mount())
    // Store the requested URL (on 401) and redirect to login or error
    .catch(error => handleBootFailure(datashare, error))
  // Register the core globally (so plugins can use it)
  window.datashare = datashare
}
```

Notes:
- The requested URL is captured *before* mounting, so it cannot race with the initial navigation triggered by `mount()`.
- `useAppStore(core.pinia)` passes the Pinia instance explicitly because no active Pinia is guaranteed before the app is mounted.
- `{ name: 'login' }` replaces the previous relative-string `push('login')`, which resolved incorrectly from nested URLs.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `yarn test:unit tests/unit/specs/core/handleBootFailure.spec.js tests/unit/specs/main.spec.js`
Expected: PASS (both files — `main.spec.js` guards against regressions in the boot flow).

- [ ] **Step 5: Commit**

```bash
git add src/core/handleBootFailure.js src/main.js tests/unit/specs/core/handleBootFailure.spec.js
git commit -m "fix(core): store requested url before redirecting to login on boot 401"
```

---

### Task 5: Full-suite verification

**Files:**
- No changes — verification only.

**Interfaces:**
- Consumes: all changes from Tasks 1-4.
- Produces: green test suite and lint.

- [ ] **Step 1: Run the whole unit test suite**

Run: `yarn test:unit`
Expected: PASS. Pay attention to any test that navigates routes while unauthenticated — the guard reordering (Task 3) changes where such navigations land (login instead of error). If a pre-existing test asserted the old (buggy) destination, update its expectation to `login` and note it in the commit.

- [ ] **Step 2: Run the linter**

Run: `yarn lint 2>/dev/null || npx eslint src/router/guards/index.js src/store/modules/app.js src/core/handleBootFailure.js src/main.js`
Expected: no errors on the touched files.

- [ ] **Step 3: Commit (only if fixes were needed)**

```bash
git add -A tests src
git commit -m "test(router): adjust expectations for auth-before-role guard order"
```

Skip this step if Steps 1-2 required no changes.

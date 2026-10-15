# Restore deep links after login in server mode

**Date:** 2026-07-28
**Status:** Approved

## Problem

In server mode, an unauthenticated user who opens a deep link (e.g. a shared
document or search URL) is redirected to the login page, but after logging in
they land on the default page instead of the URL they originally requested.
This affects both authentication flows: form auth (`--auth form`, in-app login
card followed by a full page reload to `/`) and OAuth (full page round-trip to
the backend signin endpoint, returning to `/`).

## Root causes

The redirect-after-login mechanism already exists — `redirectAfterLogin` in
the app store, persisted to localStorage, stored by the router guard and
popped by `proceedAuthenticated` on the first authenticated navigation. The
storage is sound and survives both full-page round-trips. The capture is not:

1. **Boot-failure path bypasses the guard.** In server mode the boot sequence
   itself fails with a 401 (settings fetch in `Core.configure()`), and
   `src/main.js` handles it by calling `router.push('login')` directly —
   without storing the requested URL, and racing with the initial navigation
   whose guard would have stored it. `push('login')` is also a relative-path
   push that can resolve incorrectly from a nested URL.
2. **Guard ordering.** `checkUserRole` runs before `checkUserAuthentication`
   (`src/router/guards/index.js`). For an unauthenticated user hitting a
   role-protected route, the role lookup fails and they are sent to the
   *error* page instead of login, so the redirect is never stored.
3. **Query and hash are dropped.** The guard stores `to.path`, not
   `to.fullPath`, so even when the redirect works, query string and hash are
   lost.

## Design

Client-only fix; no backend change.

### 1. Capture — router guard (`src/router/guards/index.js`)

`proceedUnauthenticated` stores `to.fullPath` instead of `to.path`. No other
change to its logic.

### 2. Capture — boot failure (`src/main.js`)

In the 401 catch, before navigating to login, store the URL the user actually
requested — `window.location.hash.slice(1) || '/'`, because the router uses
`createWebHashHistory()` so the whole route (path, query, hash) lives in
`location.hash` (`#/route?query`) — via `appStore.setRedirectAfterLogin(...)`
(Pinia is already installed on the core at that point). *(Corrected during
final review: the original design wrongly assumed path-style URLs and captured
`pathname + search + hash`.)* Replace `router.push('login')`
with `router.push({ name: 'login' })` so the navigation resolves correctly
from any nested URL.

### 3. Guard ordering (`src/router/guards/index.js`)

Register `checkUserAuthentication` before `checkUserRole`. `checkMode` stays
first (it does not depend on the user). Rationale: an unauthenticated user
must be sent to login with their destination stored, not to a "not found"
error produced by a role check that cannot succeed without a session.
Authenticated users see no behavior change — role checks still run before the
route renders.

### 4. Restore and sanitization (`src/store/modules/app.js`)

`setRedirectAfterLogin` keeps rejecting `/login...` and additionally rejects
any non-null value that does not start with `/`. Passing `null` still clears
the stored value (used by `popRedirectAfterLogin`). This prevents storing
absolute URLs (open-redirect input) and covers hash- or query-only edge
cases.

`proceedAuthenticated` passes the popped value to `next(path)` as a fullPath
string, preserving query and hash. Pop-on-first-authenticated-navigation
semantics are unchanged; no expiry — a stored redirect from an abandoned
session fires on the next login, which reads as "continue where you left
off".

## Error handling

- Values rejected by the sanitizer leave `redirectAfterLogin` unchanged
  (`null` by default), so login falls through to the default landing page.
- If the popped path equals the current target path, `proceedAuthenticated`
  proceeds without an extra redirect (existing behavior).

## Testing

- **Guard unit tests:** unauthenticated deep link with query and hash stores
  the fullPath and redirects to login; unauthenticated navigation to a
  role-protected route goes to login, not error; authenticated first
  navigation pops the stored value and redirects to it; no stored value
  passes through untouched.
- **Store unit tests:** setter rejects `/login...` and values not starting
  with `/`; pop returns the value and clears it.
- **Boot 401 path:** a direct unit test of `src/main.js` is awkward due to
  module side effects. If needed for testability, extract the capture into a
  small helper and test that; otherwise the behavior is covered by the guard
  tests plus manual verification in server mode.

## Out of scope

- Backend changes (e.g. carrying the original URL through the OAuth
  callback).
- Expiry/TTL for the stored redirect.
- Any change to LOCAL/EMBEDDED modes (no login flow there).

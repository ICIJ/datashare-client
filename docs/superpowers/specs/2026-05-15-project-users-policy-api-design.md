# Design: Project Users List — Real Policy API

**Date:** 2026-05-15  
**Status:** Approved

## Problem

`ProjectViewEditUsers.vue` renders a hardcoded list of six fake users. The `TODO` comment marks it for replacement with a real API call.

## Solution

Replace the fake data with a call to `GET /api/policies/local/{project}` via the existing `Api.getProjectPolicies(domain, project)` method. Map the response entries (`{ user, role }`) to the shape `ProjectUsersList` already expects (`{ name, role }`).

## Architecture

- **`ProjectViewEditUsers.vue`** — only file that changes.
  - Declares `name` prop (the route already passes it via `props: true`).
  - Uses `useCore()` to access `core.api`.
  - Fetches `core.api.getProjectPolicies('local', name)` on mount (domain hardcoded to `'local'`).
  - Maps response: `entries.map(e => ({ name: e.user, role: e.role }))`.
  - Passes a loading flag to show an overlay while fetching.
  - On error, surfaces a toast notification.

- **`ProjectUsersList.vue`** — no changes needed; already accepts `users: Array`.

## Data flow

```
mount → core.api.getProjectPolicies('local', name)
      → response: [{ user, role }, ...]
      → map to [{ name, role }, ...]
      → :users="users" → ProjectUsersList
```

## Error handling

Wrap the fetch in try/catch; on failure show a toast error. Loading state is tracked with a `ref(false)` flipped around the await.

## Testing

- Unit-test the view: mock `core.api.getProjectPolicies`, assert `ProjectUsersList` receives the mapped users.
- Assert loading state is shown during fetch and hidden after.
- Assert toast error is shown when the API call rejects.

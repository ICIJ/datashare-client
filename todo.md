# ES thin-client: test coverage follow-up

Context: `6f3849e7f` replaced `elasticsearch-browser` with a hand-rolled axios
`Client`/`Transport` (`src/api/elasticsearchClient.js`) and shipped with no
new tests — existing suites only exercise it through mocks/spies. That gap
already let two real bugs through this session (array query params
serialized as `_source[]=...` and rejected by ES, and a missing `getSource`
method), both only caught against a real backend.

## Backlog

1. ~~**`tests/unit/specs/api/elasticsearchClient.spec.js` (new)** — unit tests~~ **Done.**
   for `Transport`/`Client` in isolation, mocking `axios` directly
   (`vi.mock('axios')`, no new dependency needed). Cover:
   - `Transport.request` builds the right axios call: `baseURL`, `url`,
     `method`, `data`, and array query params serializing as repeated
     `key=val` (`paramsSerializer: { indexes: null }`), not `key[]=val`.
   - `compactQuery` drops `undefined` params.
   - `.abort()` on the returned promise calls `controller.abort()`.
   - `Client.get`/`getSource`/`search`/`count` hit the expected path
     (`/_doc/:id`, `/_source/:id`, `/_search`, `/_count`) with the right verb.
   - `csrfPlugin` still injects the header (reuse the pattern already at
     `elasticsearch.spec.js:220`, don't duplicate it).

2. ~~**Live-ES async-search test**~~ **Done.** — extended `elasticsearch.asyncSearch.spec.js`
   (or a sibling spec) with one test that goes through `esConnectionHelper`'s
   real index and calls `submitAsyncSearch` / `getAsyncSearch` /
   `deleteAsyncSearch` on the real `elasticsearch` singleton (real
   `Transport` → real axios → real ES). Highest-value addition: it's the
   exact bug class (wire-format mismatch) mocks can't catch.

3. ~~**Regression test for error passthrough**~~ **Done.** — assert a failed request
   rejects with the raw axios error and still calls
   `EventBus.emit('http::error', ...)`/respects `signal.aborted`, per
   `handleSearchError`/`emitSearchErrorUnlessAborted`. No status-shape
   contract needed — nothing in the app depends on one (checked: no
   `.status`/`.statusCode`/`.body`/`instanceof` checks on ES errors
   anywhere in `src/`).

4. ~~Manual browser verification~~ **Dropped** — out of scope per user.

5. ~~Full suite pre-merge run~~ **Dropped** — out of scope per user.

6. ~~**Fix commit message**~~ **Done.** Amended `6f3849e7f` -> `1ec0937f7`
   (force-pushed) to drop the false "no real ES cluster was available" claim
   and name the two bugs that gap actually caused.

7. ~~**Retry parity with elasticsearch-browser**~~ **Done**, built TDD.
   elasticsearch-browser retried every request up to 3 times by default,
   silently, at the transport layer, on connection-level failures only
   (never on an actual HTTP error response — a 400/500 is a real ES answer,
   not a transient blip). The new thin `Transport.request` made exactly one
   attempt, a real regression. `elasticsearchClient.js` now retries up to
   `maxRetries` (default 3, configurable via `Client`/`Transport` options)
   on network-level failures (`!error.response`), stops immediately on an
   HTTP error response or once `.abort()` is called, and reuses one
   `AbortSignal` across all retries. No backoff delay between attempts —
   matches elasticsearch-browser's own behavior, not a new gap. Covered in
   `tests/unit/specs/api/elasticsearchClient.spec.js` (retry-until-success,
   give-up-after-default, custom `maxRetries`, no-retry-on-HTTP-error,
   abort-stops-retrying).

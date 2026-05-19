# Test Suite Performance Improvement Plan

## Context

The test suite has 192 spec files (~20k lines). Currently tests run on a **single worker** (`maxWorkers: 1`) which forces serial execution. 29 files require a live Elasticsearch instance (via `esConnectionHelper`), while the other 163 are pure unit/component tests.

## Baseline (measured)

```
Test Files  192 passed | 1 skipped (193)
    Tests  1591 passed | 7 skipped (1598)
 Duration  589.04s (transform 42.38s, setup 1.45s, collect 307.22s,
                    tests 131.53s, environment 99.29s, prepare 14.48s)
```

| Phase | Time | % of total | Note |
|-------|------|------------|------|
| **collect** | 307s | **52%** | Loading/parsing all test file imports — the dominant cost |
| **tests** | 132s | 22% | Actual test logic execution |
| **environment** | 99s | 17% | jsdom setup per file |
| transform | 42s | 7% | Vite compilation |
| prepare | 14s | 2% | Worker startup |
| setup | 1s | <1% | Global setup.js |

**Key insight:** Only 22% of runtime is actual test execution. 69% is collect + environment — work that happens _before_ any test runs and that is entirely serialized by `maxWorkers: 1`. Parallelism is the single highest-leverage fix.

---

## Identified Issues (Prioritized)

### Critical

| # | Issue | File | Estimated saving |
|---|-------|------|-----------------|
| 1 | `maxWorkers: 1` serializes collect (307s) + environment (99s) across all 192 files | `vitest.config.js:30-31` | ~200–300s with 4+ workers |
| 2 | Heavy imports in every test file — avg **1.6s/file** just to load (307s ÷ 192) | CoreSetup, ES client, router, Pinia | Reduced by parallelism + lazy imports |

### High

| # | Issue | File | Estimated saving |
|---|-------|------|-----------------|
| 3 | `setTimeout(noop, 1e3 * indices.length)` is **not awaited** in esConnectionHelper — no actual delay, potential flakiness | `esConnectionHelper.js:41` | Correctness fix, not speed |
| 4 | `CoreSetup.init().useAll()` re-registers 8 Vue plugins in `beforeEach` across 132 files | `CoreSetup.js` | ~10–30s in tests phase |

### Medium

| # | Issue | File | Estimated saving |
|---|-------|------|-----------------|
| 5 | No test split — ES integration tests mixed with unit tests; all run together | `vitest.config.js` | Enables fast local iteration |
| 6 | 230+ `mount()` calls render full trees; many could be `shallowMount()` | `tests/unit/specs/**` | ~5–15s in tests phase |

### Low

| # | Issue | Impact |
|---|-------|--------|
| 7 | Monolithic test files (`search.spec.js` = 1,187 lines) | Collect time per file |
| 8 | No `test.concurrent` for independent tests within a file | Minor |

---

## TODO List

### Phase 1 — Measure (baseline captured ✓, now get per-file data)

- [ ] Run with `--reporter=verbose` to get per-file timing and identify the 20 slowest test files
  ```
  yarn test:unit --reporter=verbose 2>&1 | grep -E "^\s+(PASS|FAIL|×|✓)" | sort
  ```

```sh
  yarn test:unit --reporter=json --outputFile=/tmp/vitest-results.json 2>/dev/null && \
    node -e "
      const r = require('/tmp/vitest-results.json')
      r.testResults
        .sort((a,b) => b.duration - a.duration)
        .slice(0, 20)
        .forEach(f => console.log(
          String(f.duration).padStart(6) + 'ms  ' +
          f.testFilePath.replace(process.cwd() + '/', '')
        ))
    "
```
- [ ] Note which files have the highest collect time vs test time (vitest JSON reporter gives this per-file)

### Phase 2 — Quick wins (no architecture change)

- [x] **Fix the non-awaited setTimeout** in `tests/unit/specs/utils/esConnectionHelper.js:41`:
  ```js
  // Before (no-op):
  setTimeout(noop, 1e3 * indices.length)
  // After (actual delay):
  await new Promise(r => setTimeout(r, 1e3 * indices.length))
  ```
  Then experiment reducing or removing the delay once flakiness is verified fixed.

- [x] **Increase `maxWorkers`** in `vitest.config.js` — try `maxWorkers: 4` (or `'auto'`). The ES tests use randomly-named indices per `build()` call so they should be isolatable. Watch for flakiness and tune down if needed.

- [ ] Add a `test:unit:no-es` script in `package.json` that excludes ES integration tests, for fast local iteration without Elasticsearch running.

### Phase 3 — CoreSetup optimization

- [x] Measure cost: wrap `CoreSetup.init().useAll()` with `console.time` in a representative `beforeEach` to quantify the overhead
    ┌────────────┬────────────────────────────────────┐
    │   Call #   │ CoreSetup.init().useAll() duration │
    ├────────────┼────────────────────────────────────┤
    │ 1st (cold) │ 30.9 ms                            │
    ├────────────┼────────────────────────────────────┤
    │ 2nd        │ 8.9 ms                             │
    ├────────────┼────────────────────────────────────┤
    │ 3rd        │ 7.6 ms                             │
    ├────────────┼────────────────────────────────────┤
    │ 4th        │ 6.2 ms                             │
    ├────────────┼────────────────────────────────────┤
    │ 5th        │ 6.3 ms                             │
    ├────────────┼────────────────────────────────────┤
    │ 6th        │ 7.0 ms                             │
    └────────────┴────────────────────────────────────┘

Key finding: The first call costs ~31 ms (cold initialization), subsequent calls drop to ~7–9 ms each. Across 6 tests in this one file that's ~67 ms
total overhead — and the pattern repeats in every file that calls CoreSetup.init().useAll() in beforeEach.

- [x] In test files that call `CoreSetup.init().useAll()` in `beforeEach`, move it to `beforeAll()` and only reset Pinia state per test (`core.createPinia()`) — avoids re-registering plugins for every single test
    - Refactored 77 spec files across 3 parallel agent runs
    - Pattern: `beforeAll` for `CoreSetup.init().useAll()` + router init; `beforeEach` for `core.createPinia()` + `plugins = core.plugins`
    - Special handling: nested describes (PathTree, WidgetDocumentsByCreationDate), `.createPinia().useAll()` files, core state mutations (WidgetsMixin), router-push files with `await core.router.replace('/')`
    - **Result: 300.94s total (vs 589.04s baseline) — 49% faster** ✓

### Phase 4 — Target slow files (data from Phase 1)

- [ ] For the slowest test files identified, check if `mount()` can be replaced with `shallowMount()` where child component behavior isn't under test
- [ ] For test files with many independent `it()` blocks and no shared state, add `describe.concurrent(...)` or `test.concurrent(...)`

### Phase 5 — Architecture (longer term)

- [ ] Split test commands in `package.json`:
  - `test:unit` — exclude ES integration tests (fast, no ES required)
  - `test:integration` — only ES tests
- [ ] Update CI to run both commands **in parallel** as two separate jobs

---

## Files to Modify

| File | Change |
|------|--------|
| `vitest.config.js` | Increase `maxWorkers`, add verbose reporter option |
| `tests/unit/specs/utils/esConnectionHelper.js` | Await the setTimeout |
| `package.json` | Add `test:unit:no-es` and later `test:integration` scripts |
| Selected spec files (Phase 3–4) | Move CoreSetup to `beforeAll`, swap `mount` → `shallowMount` |

---

## Verification

After each phase:
1. Run `yarn test:unit` and compare total elapsed time against baseline
2. Run the suite 3× to check for new flakiness introduced by parallelism
3. Confirm CI green after each merged change

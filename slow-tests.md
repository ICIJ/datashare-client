# Slowest Test Files (2026-05-05, after sleep + LinkedDocumentsCard + ProjectViewEditDetails fixes)

Run config: maxWorkers=4, pool=forks
Total files: 192
All tests passed: true
Sum of file durations: 151s
Wall-clock time: 262s

## Progress

| Milestone | Wall-clock |
|-----------|------------|
| Baseline (maxWorkers=1) | 589s |
| After maxWorkers=4 + CoreSetup→beforeAll | 301s |
| After removing esConnectionHelper sleep | 300s |
| After LinkedDocumentsCard stub + ProjectViewEditDetails direct mount | **262s** |

## Top 30 Slowest Files

| Rank | Duration | Tests | ms/test | File |
|------|----------|-------|---------|------|
| 1 | 11.7s | 4 | 2925ms | `tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsMetadata.spec.js` |
| 2 | 8.1s | 17 | 476ms | `tests/unit/specs/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri.spec.js` |
| 3 | 7.8s | 7 | 1111ms | `tests/unit/specs/views/Task/TaskBatchDownload/TaskBatchDownloadList.spec.js` |
| 4 | 7.2s | 2 | 3586ms | `tests/unit/specs/views/Search/SearchSaved/SearchSavedList/SearchSavedList.spec.js` |
| 5 | 6.8s | 131 | 52ms | `tests/unit/specs/store/modules/search.spec.js` |
| 6 | 6.5s | 12 | 544ms | `tests/unit/specs/components/Document/DocumentContent.spec.js` |
| 7 | 6.4s | 10 | 643ms | `tests/unit/specs/components/PathTree/PathTree.spec.js` |
| 8 | 5.2s | 3 | 1717ms | `tests/unit/specs/components/Task/TaskEntities/TaskEntitiesList.spec.js` |
| 9 | 4.7s | 2 | 2339ms | `tests/unit/specs/views/Task/TaskBatchSearch/TaskBatchSearchList.spec.js` |
| 10 | 4.4s | 2 | 2207ms | `tests/unit/specs/views/Search/SearchHistory/SearchHistoryList/SearchHistoryList.spec.js` |
| 11 | 4.1s | 18 | 227ms | `tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshots.spec.js` |
| 12 | 3.9s | 22 | 179ms | `tests/unit/specs/components/Filter/FilterType/FilterType.spec.js` |
| 13 | 3.5s | 21 | 168ms | `tests/unit/specs/components/Project/ProjectForm.spec.js` |
| 14 | 3.2s | 8 | 401ms | `tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsList.spec.js` |
| 15 | 3.0s | 8 | 379ms | `tests/unit/specs/components/Task/TaskEntities/TaskEntitiesForm.spec.js` |
| 16 | 3.0s | 6 | 502ms | `tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsEntities.spec.js` |
| 17 | 2.7s | 35 | 78ms | `tests/unit/specs/composables/useEsSnapshots.spec.js` |
| 18 | 2.7s | 5 | 539ms | `tests/unit/specs/components/Document/DocumentTranslation/DocumentTranslation.spec.js` |
| 19 | 2.5s | 3 | 823ms | `tests/unit/specs/views/Error/Error.spec.js` |
| 20 | 2.2s | 8 | 281ms | `tests/unit/specs/views/Settings/SettingsView/SettingsViewSnapshots.spec.js` |
| 21 | 2.2s | 25 | 90ms | `tests/unit/specs/router/guards.spec.js` |
| 22 | 1.8s | 7 | 252ms | `tests/unit/specs/components/Login/LoginCard.spec.js` |
| 23 | 1.8s | 4 | 440ms | `tests/unit/specs/components/Login/LoginWelcome.spec.js` |
| 24 | 1.7s | 4 | 434ms | `tests/unit/specs/views/Settings/SettingsView/SettingsViewApi.spec.js` |
| 25 | 1.6s | 9 | 182ms | `tests/unit/specs/components/Search/SearchBar/SearchBar.spec.js` |
| 26 | 1.4s | 9 | 156ms | `tests/unit/specs/components/Form/FormControl/FormControlTag/FormControltag.spec.js` |
| 27 | 1.4s | 6 | 233ms | `tests/unit/specs/components/Document/DocumentEntries/DocumentEntriesHeader.spec.js` |
| 28 | 1.3s | 4 | 318ms | `tests/unit/specs/components/Task/TaskDocuments/TaskDocumentsForm.spec.js` |
| 29 | 1.2s | 19 | 64ms | `tests/unit/specs/store/modules/document.spec.js` |
| 30 | 1.2s | 1 | 1210ms | `tests/unit/specs/views/Project/ProjectView/ProjectViewEdit/ProjectViewEditDetails.spec.js` |

## Observations

- Top 5 files account for 27% of total duration
- Top 10 files account for 45% of total duration
- Files with ms/test > 500ms likely have real ES calls or heavy mounts
- search.spec.js (131 tests) now at rank 6 — confirming sleep removal fixed the outlier

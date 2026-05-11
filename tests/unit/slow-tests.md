# Slowest Tests

| Rank | Duration (ms) | Test |
|------|--------------|------|
| 1 | 2942 | tests/unit/specs/components/Document/DocumentContent.spec.js > DocumentContent.vue > search term > with 2 occurrences > should highlight the first occurrence of the searched term |
| 2 | 2911 | tests/unit/specs/views/Search/SearchSaved/SearchSavedList/SearchSavedList.spec.js > Search/SearchSaved/SearchSavedList.vue > should display load next page |
| 3 | 2640 | tests/unit/specs/views/Search/SearchHistory/SearchHistoryList/SearchHistoryList.spec.js > SearchHistoryList.vue > should display a list of two documents |
| 4 | 2495 | tests/unit/specs/views/Task/TaskBatchSearch/TaskBatchSearchList.spec.js > TaskBatchSearchList > should display 2 batch searches |
| 5 | 2305 | tests/unit/specs/views/Task/TaskBatchSearch/TaskBatchSearchList.spec.js > TaskBatchSearchList > should not display actions if I m not the owner of the batch search |
| 6 | 2290 | tests/unit/specs/components/Document/DocumentTranslation/DocumentTranslation.spec.js > DocumentTranslation.vue > should show document translation alert and display english translation |
| 7 | 2101 | tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsMetadata.spec.js > DocumentViewTabsMetadata.vue > should display document with 8 metadata (including language) |
| 8 | 2045 | tests/unit/specs/components/Task/TaskEntities/TaskEntitiesList.spec.js > TaskEntitiesList.vue > renders correctly |
| 9 | 1897 | tests/unit/specs/views/Search/SearchHistory/SearchHistoryList/SearchHistoryList.spec.js > SearchHistoryList.vue > should display a button for each day |
| 10 | 1703 | tests/unit/specs/components/Task/TaskEntities/TaskEntitiesList.spec.js > TaskEntitiesList.vue > should display the correct values in the correct columns for row 1 |
| 11 | 1644 | tests/unit/specs/components/Task/TaskEntities/TaskEntitiesList.spec.js > TaskEntitiesList.vue > should display 1 ExtractNlpTask and 1 EnqueueFromIndexTask task |
| 12 | 1634 | tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsMetadata.spec.js > DocumentViewTabsMetadata.vue > should display "File on disk" when extractionLevel metadata is missing |
| 13 | 1569 | tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsMetadata.spec.js > DocumentViewTabsMetadata.vue > should filter the list with a query |
| 14 | 1544 | tests/unit/specs/views/Task/TaskBatchDownload/TaskBatchDownloadList.spec.js > TaskBatchDownloadList.vue > should display 2 batch download tasks |
| 15 | 1517 | tests/unit/specs/router/guards.spec.js > guards > checkUserAuthentication > when the route skips auth > should allow navigation to a skipsAuth route without a cookie |
| 16 | 1428 | tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsMetadata.spec.js > DocumentViewTabsMetadata.vue > should display document with 8 metadata |
| 17 | 1413 | tests/unit/specs/views/Task/TaskBatchDownload/TaskBatchDownloadList.spec.js > TaskBatchDownloadList.vue > should display the correct values in the correct columns for row 1 |
| 18 | 1285 | tests/unit/specs/views/Task/TaskBatchDownload/TaskBatchDownloadList.spec.js > TaskBatchDownloadList.vue > should display batch download actions |
| 19 | 1255 | tests/unit/specs/views/Task/TaskBatchDownload/TaskBatchDownloadList.spec.js > TaskBatchDownloadList.vue > should not show a truncated alert when truncationReason is absent |
| 20 | 1237 | tests/unit/specs/components/Document/DocumentViewer/DocumentViewerLegacySpreadsheet.spec.js > DocumentViewerLegacySpreadsheet.vue > should load a xlsx content file |
| 21 | 1199 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsList.spec.js > SettingsSnapshotsList > should emit restore event from actions |
| 22 | 1188 | tests/unit/specs/views/Error/Error.spec.js > Error.vue > local mode > should display a link when user is logged in in server mode |
| 23 | 1161 | tests/unit/specs/components/Document/DocumentTranslation/DocumentTranslation.spec.js > DocumentTranslation.vue > fallback on original content if translated is not provided |
| 24 | 1099 | tests/unit/specs/views/Settings/SettingsView/SettingsViewApi.spec.js > SettingsViewApi > should request the creation of the API key |
| 25 | 953 | tests/unit/specs/components/Task/TaskEntities/TaskEntitiesForm.spec.js > TaskEntitiesForm.vue > should display three pipelines without email |
| 26 | 927 | tests/unit/specs/components/PathTree/PathTree.spec.js > PathTree.vue > Posix > should display 4 directories including one from the tree |
| 27 | 844 | tests/unit/specs/components/Task/TaskEntities/TaskEntitiesForm.spec.js > TaskEntitiesForm.vue > should call findNames action with no models synchronization |
| 28 | 840 | tests/unit/specs/components/Task/TaskEntities/TaskEntitiesForm.spec.js > TaskEntitiesForm.vue > should reset the form on reset button clicked |
| 29 | 830 | tests/unit/specs/components/Search/SearchBar/SearchBar.spec.js > SearchBar.vue > should display a search bar input with dropdown field options |
| 30 | 822 | tests/unit/specs/views/Project/ProjectView/ProjectViewEdit/ProjectViewEditDetails.spec.js > ProjectViewEditDetails.vue > updates values of a project when the form is submitted |
| 31 | 816 | tests/unit/specs/views/Task/TaskBatchDownload/TaskBatchDownloadList.spec.js > TaskBatchDownloadList.vue > should show a truncated alert for truncationReason SIZE_LIMIT |
| 32 | 788 | tests/unit/specs/components/Task/TaskEntities/TaskEntitiesForm.spec.js > TaskEntitiesForm.vue > should call findNames action with ANOTHERNLP pipeline |
| 33 | 762 | tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsEntities.spec.js > DocumentViewTabsEntities.vue > with mocking the API > should call the api to get filtered named entities |
| 34 | 761 | tests/unit/specs/views/Settings/SettingsView/SettingsViewSnapshots.spec.js > SettingsViewSnapshots > should display snapshots when available |
| 35 | 748 | tests/unit/specs/views/Settings/SettingsView/SettingsViewSnapshots.spec.js > SettingsViewSnapshots > should display empty state when no snapshots |
| 36 | 743 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsList.spec.js > SettingsSnapshotsList > should emit delete event from actions |
| 37 | 742 | tests/unit/specs/components/PathTree/PathTree.spec.js > PathTree.vue > Windows > should be a display a correct basename on windows |
| 38 | 736 | tests/unit/specs/components/Document/DocumentContent.spec.js > DocumentContent.vue > search term > with 2 occurrences > should clean marks when updating search term |
| 39 | 719 | tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsEntities.spec.js > DocumentViewTabsEntities.vue > should display named entities in the dedicated tab |
| 40 | 714 | tests/unit/specs/components/Task/TaskEntities/TaskEntitiesForm.spec.js > TaskEntitiesForm.vue > should display selected project "local-datashare" by default |
| 41 | 695 | tests/unit/specs/components/PathTree/PathTree.spec.js > PathTree.vue > compact mode (filter column) > includes total_directories in ES query even in compact mode |
| 42 | 691 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > createSnapshot > should call API to create snapshot with version and opensearch distribution |
| 43 | 647 | tests/unit/specs/components/PathTree/PathTree.spec.js > PathTree.vue > compact mode (filter column) > shows remaining directory count in "show more" button in compact mode |
| 44 | 643 | tests/unit/specs/views/Task/TaskBatchDownload/TaskBatchDownloadList.spec.js > TaskBatchDownloadList.vue > should show a truncated alert for truncationReason FILE_COUNT_LIMIT |
| 45 | 635 | tests/unit/specs/components/Document/DocumentContent.spec.js > DocumentContent.vue > search term > with 2 occurrences > should find the previous and next occurrence, as a loop |
| 46 | 630 | tests/unit/specs/components/Document/DocumentContent.spec.js > DocumentContent.vue > document content lazy loading > should lazy load the entire document |
| 47 | 624 | tests/unit/specs/components/Document/DocumentContent.spec.js > DocumentContent.vue > document content lazy loading > should lazy load 2 slices of 10 characters of a long text document |
| 48 | 623 | tests/unit/specs/components/PathTree/PathTree.spec.js > PathTree.vue > Posix > should be a Vue instance |
| 49 | 617 | tests/unit/specs/views/Settings/SettingsView/SettingsViewApi.spec.js > SettingsViewApi > should delete the apiKey |
| 50 | 609 | tests/unit/specs/components/PathTree/PathTree.spec.js > PathTree.vue > Posix > should be a display a correct basename |
| 51 | 607 | tests/unit/specs/components/Search/SearchBar/SearchBar.spec.js > SearchBar.vue > should display a suggestion dropdown when there are suggestions |
| 52 | 604 | tests/unit/specs/views/Error/Error.spec.js > Error.vue > local mode > should display a custom title |
| 53 | 592 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsList.spec.js > SettingsSnapshotsList > should render actions for each snapshot |
| 54 | 583 | tests/unit/specs/components/Task/TaskDocuments/TaskDocumentsForm.spec.js > TaskDocumentsForm.vue > should show the project selector |
| 55 | 568 | tests/unit/specs/components/Search/SearchBar/SearchBarInputDropdownForProjects.spec.js > SearchBarInputDropdownForProjects > renders correctly |
| 56 | 526 | tests/unit/specs/components/Document/DocumentEntries/DocumentEntriesHeader.spec.js > DocumentEntriesHeader.vue — runBatchDownload orchestration > runs the download and toasts success when estimation succeeds and limits are not exceeded |
| 57 | 523 | tests/unit/specs/views/Search/SearchSaved/SearchSavedList/SearchSavedList.spec.js > Search/SearchSaved/SearchSavedList.vue > should display a list of 2 saved search |
| 58 | 501 | tests/unit/specs/components/Task/TaskDocuments/TaskDocumentsForm.spec.js > TaskDocumentsForm.vue > should index document with OCR to true when selected |
| 59 | 499 | tests/unit/specs/components/Widget/WidgetDocuments.spec.js > WidgetDocuments.vue > should display the total number of document |
| 60 | 498 | tests/unit/specs/views/Task/TaskBatchDownload/TaskBatchDownloadList.spec.js > TaskBatchDownloadList.vue > renders correctly |
| 61 | 495 | tests/unit/specs/components/VersionNumber.spec.js > VersionNumber.vue > should have client git sha1 |
| 62 | 486 | tests/unit/specs/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri.spec.js > SearchBreadcrumbUri.vue > a simple query on two indices with a filter on contentType > should parse the "apple" index and show it second |
| 63 | 484 | tests/unit/specs/components/Task/TaskEntities/TaskEntitiesForm.spec.js > TaskEntitiesForm.vue > reactively updates content when project changes |
| 64 | 484 | tests/unit/specs/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri.spec.js > SearchBreadcrumbUri.vue > a simple query on two indices with a filter on contentType > should parse the query and show it third |
| 65 | 482 | tests/unit/specs/components/Login/LoginCard.spec.js > LoginCard.vue > should render the illustration panel with the login image |
| 66 | 478 | tests/unit/specs/components/PathTree/PathTree.spec.js > PathTree.vue > Windows > should display 3 directories including one from the tree on windows |
| 67 | 471 | tests/unit/specs/components/Document/DocumentContent.spec.js > DocumentContent.vue > search term > with 3 occurrences > should be case insensitive |
| 68 | 463 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsList.spec.js > SettingsSnapshotsList > should display table headers |
| 69 | 460 | tests/unit/specs/components/VersionNumber.spec.js > VersionNumber.vue > should display git sha1 in a tooltip |
| 70 | 449 | tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js > ProjectDropdownSelector.vue > should display a dropdown with 3 options for each project |
| 71 | 445 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsList.spec.js > SettingsSnapshotsList > should display table when snapshots exist |
| 72 | 431 | tests/unit/specs/router/guards.spec.js > guards > checkUserRole > should not redirect routes without allowedRole |
| 73 | 425 | tests/unit/specs/views/Error/Error.spec.js > Error.vue > server mode > should not display a link when user is logged out in server mode |
| 74 | 422 | tests/unit/specs/components/Filter/FilterType/FilterTypeStarred.spec.js > FilterTypeStarred.vue > should display 3 items for the starred filter (including "All") |
| 75 | 418 | tests/unit/specs/components/Task/Task.spec.js > Task.vue > show a page header with task actions |
| 76 | 413 | tests/unit/specs/views/Document/DocumentView/DocumentView.spec.js > DocumentView.vue > should display an error message if document is not found |
| 77 | 408 | tests/unit/specs/components/VersionNumber.spec.js > VersionNumber.vue > should display server version |
| 78 | 399 | tests/unit/specs/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri.spec.js > SearchBreadcrumbUri.vue > a simple query on two indices with a filter on contentType > should parse the "banana" index and show it first |
| 79 | 387 | tests/unit/specs/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri.spec.js > SearchBreadcrumbUri.vue > a simple query on one index with 2 filters on contentType > should parse the query and show it second |
| 80 | 386 | tests/unit/specs/components/Document/DocumentEntries/DocumentEntriesHeader.spec.js > DocumentEntriesHeader.vue — runBatchDownload orchestration > runs the download when limits are exceeded and the user confirms |
| 81 | 382 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBannersModal.spec.js > ProjectViewEditPathBannersModal.vue > modal is open when route has bannerId=new |
| 82 | 382 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > deleteRepository > should delete repository and clear state |
| 83 | 381 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshots.spec.js > SettingsSnapshots > when repository is configured > should emit delete event from list |
| 84 | 373 | tests/unit/specs/components/Document/DocumentThread/DocumentThread.spec.js > DocumentThread.vue > get thread > should filter on contentType to retrieve emails only |
| 85 | 358 | tests/unit/specs/components/Document/DocumentEntries/DocumentEntriesHeader.spec.js > DocumentEntriesHeader.vue — runBatchDownload orchestration > skips the download when limits are exceeded and the user cancels |
| 86 | 356 | tests/unit/specs/components/Search/SearchBar/SearchBarInputDropdownForProjects.spec.js > SearchBarInputDropdownForProjects > fallbacks on default project if no selection |
| 87 | 353 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshots.spec.js > SettingsSnapshots > when repository is configured > should display repository type |
| 88 | 347 | tests/unit/specs/components/Filter/FilterType/FilterTypeRecommendedBy.spec.js > FilterTypeRecommendedBy.vue > should build a recommendedBy filter |
| 89 | 334 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > fetchRepositories > should fetch all repositories |
| 90 | 329 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Search response > should exclude documents with a specific named entity and include them again |
| 91 | 329 | tests/unit/specs/components/Document/DocumentEntries/DocumentEntriesHeader.spec.js > DocumentEntriesHeader.vue — runBatchDownload orchestration > runs the download when estimation fails and the user confirms the fallback |
| 92 | 327 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshots.spec.js > SettingsSnapshots > when repository is configured > should emit restore event from list |
| 93 | 312 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshots.spec.js > SettingsSnapshots > when repository is configured > should pass snapshots to the list component |
| 94 | 309 | tests/unit/specs/components/Project/ProjectForm.spec.js > ProjectForm.vue > without an existing project > should generate a slugified name when setting the label |
| 95 | 309 | tests/unit/specs/components/Document/DocumentTranslation/DocumentTranslation.spec.js > DocumentTranslation.vue > should show no translations |
| 96 | 306 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > restoreSnapshot > should still reopen indices if restore fails |
| 97 | 305 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > fetches banners on mount |
| 98 | 304 | tests/unit/specs/components/Display/DisplayEmail.spec.js > DisplayEmail.vue > is a Vue instance |
| 99 | 301 | tests/unit/specs/components/Filter/FilterType/FilterTypeDateRange.spec.js > FilterTypeDateRange.vue > should add selected value to dedicated filter |
| 100 | 298 | tests/unit/specs/store/modules/starred.spec.js > StarredStore > should star a batch of documents |
| 101 | 289 | tests/unit/specs/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri.spec.js > SearchBreadcrumbUri.vue > a simple query on one index with 2 filters on contentType > should parse all fields from the URI |
| 102 | 289 | tests/unit/specs/components/Entity/EntityInContext.spec.js > EntityInContext.vue > should be a Vue instance |
| 103 | 284 | tests/unit/specs/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri.spec.js > SearchBreadcrumbUri.vue > a simple query on two indices > should parse the "apple" index and show it second |
| 104 | 284 | tests/unit/specs/api/elasticsearch.spec.js > elasticsearch > should return only one named entity |
| 105 | 283 | tests/unit/specs/router/guards.spec.js > guards > checkUserAuthentication > when the user is authenticated > should redirect to stored path after login |
| 106 | 283 | tests/unit/specs/components/Login/LoginWelcome.spec.js > LoginWelcome.vue > should render the login image |
| 107 | 280 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > contentType > should return filters from another index |
| 108 | 280 | tests/unit/specs/components/Document/DocumentEntries/DocumentEntriesHeader.spec.js > DocumentEntriesHeader.vue — runBatchDownload orchestration > skips the download when estimation fails and the user cancels the fallback |
| 109 | 274 | tests/unit/specs/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri.spec.js > SearchBreadcrumbUri.vue > a simple query on one index with 2 filters on contentType > should parse the content type filter and show it fourth for PNG |
| 110 | 273 | tests/unit/specs/components/Login/LoginCard.spec.js > LoginCard.vue > should render the form panel with the login form |
| 111 | 273 | tests/unit/specs/components/Document/DocumentEntries/DocumentEntriesHeader.spec.js > DocumentEntriesHeader.vue — runBatchDownload orchestration > toasts an error when runBatchDownload rejects |
| 112 | 269 | tests/unit/specs/components/Project/ProjectForm.spec.js > ProjectForm.vue > without an existing project > should not submit the form with a reserved word as label |
| 113 | 269 | tests/unit/specs/components/Project/ProjectForm.spec.js > ProjectForm.vue > without an existing project > should not be able to submit the form when `disabled` is set |
| 114 | 268 | tests/unit/specs/components/Document/DocumentGlobalSearchTerms.spec.js > DocumentGlobalSearchTerms.vue > lists the query terms but the ones about specific field other than "content" > should display query terms with occurrences in decreasing order |
| 115 | 263 | tests/unit/specs/views/Search/Search.spec.js > Search.vue > is a Vue instance |
| 116 | 263 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > contentType > should filter filter values |
| 117 | 262 | tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js > ProjectDropdownSelector.vue > should display a dropdown with "Default" as button content |
| 118 | 261 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > createSnapshot > should call API to create snapshot with version only when distribution is missing |
| 119 | 261 | tests/unit/specs/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri.spec.js > SearchBreadcrumbUri.vue > a simple query on two indices with a filter on contentType > should parse the content type filter and show it last |
| 120 | 261 | tests/unit/specs/components/Document/DocumentViewer/DocumentViewerImage.spec.js > DocumentViewerImage.vue > should create an image tag |
| 121 | 260 | tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js > ProjectDropdownSelector.vue > should display a dropdown with "Default" selected |
| 122 | 259 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > contentType > should display 2 items for the contentType filter |
| 123 | 258 | tests/unit/specs/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri.spec.js > SearchBreadcrumbUri.vue > a simple query on two indices > should parse the query and show it third |
| 124 | 256 | tests/unit/specs/router/guards.spec.js > guards > checkMode > should not redirect settings.api to error in SERVER mode |
| 125 | 255 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Search response > should find 2 documents filtered by one contentType |
| 126 | 255 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > contentType > should display X filter items after applying the relative search |
| 127 | 253 | tests/unit/specs/components/Form/FormControl/FormControlTag/FormControltag.spec.js > FormControlTag > should render the component |
| 128 | 252 | tests/unit/specs/components/Search/SearchBar/SearchBarInputDropdownForProjects.spec.js > SearchBarInputDropdownForProjects > selects existing project |
| 129 | 250 | tests/unit/specs/components/Login/LoginCard.spec.js > LoginCard.vue > should pass disabled as false to the form by default |
| 130 | 249 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Creation date filter > should merge all missing data |
| 131 | 249 | tests/unit/specs/components/Login/LoginCard.spec.js > LoginCard.vue > should render the footer |
| 132 | 249 | tests/unit/specs/components/Login/LoginCard.spec.js > LoginCard.vue > should display the welcome heading and tagline |
| 133 | 248 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > deleteSnapshot > should call API to delete snapshot and refresh list |
| 134 | 248 | tests/unit/specs/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri.spec.js > SearchBreadcrumbUri.vue > a boolean query on one index > should parse all fields from the URI |
| 135 | 247 | tests/unit/specs/components/Search/SearchBar/SearchBarInputDropdownForProjects.spec.js > SearchBarInputDropdownForProjects > show default project if project does not exists when fallback is active |
| 136 | 246 | tests/unit/specs/components/Login/LoginCard.spec.js > LoginCard.vue > should pass error as false to the form by default |
| 137 | 244 | tests/unit/specs/components/Widget/WidgetDiskUsage.spec.js > WidgetDiskUsage.vue > should display the total number of document |
| 138 | 244 | tests/unit/specs/components/Display/DisplayEmail.spec.js > DisplayEmail.vue > renders the name of the sender only |
| 139 | 243 | tests/unit/specs/views/Settings/SettingsView/SettingsViewApi.spec.js > SettingsViewApi > should display a panel to generate the API key by default |
| 140 | 242 | tests/unit/specs/components/PathTree/PathTree.spec.js > PathTree.vue > Posix > should init selected on component creation |
| 141 | 238 | tests/unit/specs/views/Project/ProjectList/ProjectList.spec.js > ProjectList.vue > shows all projects when there is no search query |
| 142 | 237 | tests/unit/specs/components/Project/ProjectForm.spec.js > ProjectForm.vue > without an existing project > should disabled all form groups when `disabled` is set |
| 143 | 236 | tests/unit/specs/components/VariantDropdown/VariantDropdown.spec.js > VariantDropdown.vue > renders a dropdown |
| 144 | 234 | tests/unit/specs/components/Task/Task.spec.js > Task.vue > should call delete done tasks when the delete action is triggered |
| 145 | 234 | tests/unit/specs/components/Document/DocumentThread/DocumentThread.spec.js > DocumentThread.vue > get thread > should retrieve emails with the exact match of the subject, whatever is before or after |
| 146 | 233 | tests/unit/specs/components/Project/ProjectForm.spec.js > ProjectForm.vue > without an existing project > should not hide the sourcePath input |
| 147 | 231 | tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js > ProjectDropdownSelector.vue > should display a dropdown with "Default" and "Foo selected |
| 148 | 230 | tests/unit/specs/components/Project/ProjectForm.spec.js > ProjectForm.vue > without an existing project > should submit a valid form with a label and a sourceUrl |
| 149 | 222 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > contentType > should filter filter values with no results |
| 150 | 222 | tests/unit/specs/components/Document/DocumentTranslation/DocumentTranslation.spec.js > DocumentTranslation.vue > shouldn't show italian translation |
| 151 | 221 | tests/unit/specs/components/VariantDropdown/VariantDropdown.spec.js > VariantDropdown.vue > renders one item per variant option |
| 152 | 220 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Named entities filter > should aggregate only the not hidden named entities for PERSON category |
| 153 | 219 | tests/unit/specs/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.spec.js > ProjectDropdownSelector.vue > should display a dropdown with 2 projects as button content |
| 154 | 217 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > restoreSnapshot > should handle missing snapshot gracefully |
| 155 | 217 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > contentType > should apply relative filter and get back to global filter |
| 156 | 214 | tests/unit/specs/store/modules/document.spec.js > DocumentStore > should get the parent document |
| 157 | 214 | tests/unit/specs/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri.spec.js > SearchBreadcrumbUri.vue > a simple query on two indices > should parse the "banana" index and show it first |
| 158 | 213 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > restoreSnapshot > should close indices, restore snapshot, and reopen indices |
| 159 | 212 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshots.spec.js > SettingsSnapshots > when repository is configured > should display repository location |
| 160 | 212 | tests/unit/specs/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri.spec.js > SearchBreadcrumbUri.vue > a simple query on two indices with a filter on contentType > should parse all fields from the URI |
| 161 | 212 | tests/unit/specs/components/Search/SearchBar/SearchBar.spec.js > SearchBar.vue > search suggestions > should retrieve suggestions in NamedEntities and tags for default search |
| 162 | 211 | tests/unit/specs/store/modules/starred.spec.js > StarredStore > should unstar a batch of documents |
| 163 | 209 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > contentType > should display 3 items for the contentType filter |
| 164 | 208 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > extractionLevel > should display the extraction level filter with correct labels |
| 165 | 205 | tests/unit/specs/components/Document/DocumentTranslation/DocumentTranslation.spec.js > DocumentTranslation.vue > should show english translation |
| 166 | 204 | tests/unit/specs/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri.spec.js > SearchBreadcrumbUri.vue > a simple query on one index with 2 filters on contentType > should parse the content type filter and show it third for PDF |
| 167 | 204 | tests/unit/specs/components/Project/ProjectForm.spec.js > ProjectForm.vue > without an existing project > should not validate the form group if a reserved name is used as label |
| 168 | 203 | tests/unit/specs/components/Project/ProjectForm.spec.js > ProjectForm.vue > without an existing project > should submit a valid form with a label and a logoUrl |
| 169 | 200 | tests/unit/specs/components/Filter/FilterType/FilterTypeStarred.spec.js > FilterTypeStarred.vue > should display the results count (without the "All") |
| 170 | 199 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Content type filter > should create 3 buckets from 7 documents |
| 171 | 198 | tests/unit/specs/components/PathTree/PathTree.spec.js > PathTree.vue > Posix > should show a search bar |
| 172 | 198 | tests/unit/specs/components/Entity/EntityInContext.spec.js > EntityInContext.vue > should display the entity at the end of the text |
| 173 | 197 | tests/unit/specs/store/modules/document.spec.js > DocumentStore > should get only the not hidden document's named entities |
| 174 | 196 | tests/unit/specs/components/Form/FormControl/FormControlExtractingLanguage.spec.js > FormControlExtractingLanguage.vue > Has languages available > should list text languages and default |
| 175 | 195 | tests/unit/specs/components/Document/DocumentViewer/DocumentViewerLegacySpreadsheet.spec.js > DocumentViewerLegacySpreadsheet.vue > should load a csv content file |
| 176 | 193 | tests/unit/specs/components/Search/SearchBar/SearchBar.spec.js > SearchBar.vue > search suggestions > should order suggestions by doc_count descending |
| 177 | 193 | tests/unit/specs/components/Project/ProjectForm.spec.js > ProjectForm.vue > with an existing project > should not update name when label changes |
| 178 | 192 | tests/unit/specs/components/Form/FormControl/FormControlTag/FormControltag.spec.js > FormControlTag > should update inputValueTrigger when inputValue changes |
| 179 | 191 | tests/unit/specs/components/Entity/EntityInContext.spec.js > EntityInContext.vue > should display the entity at the beginning of the text |
| 180 | 189 | tests/unit/specs/components/Project/ProjectForm.spec.js > ProjectForm.vue > without an existing project > should not submit an invalid form with a name but an invalid sourceUrl |
| 181 | 188 | tests/unit/specs/components/Display/DisplayEmail.spec.js > DisplayEmail.vue > renders the firstname and lastname of the sender only |
| 182 | 187 | tests/unit/specs/components/Project/ProjectForm.spec.js > ProjectForm.vue > without an existing project > should not disabled any form group by default |
| 183 | 186 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Should limit response size > should return 5 documents in total |
| 184 | 186 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > fetchAvailablePaths > should fetch available paths from cluster settings |
| 185 | 186 | tests/unit/specs/components/Task/Task.spec.js > Task.vue > should stop pending tasks when the stop pending action is triggered |
| 186 | 184 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Query within NamedEntity > should find document on querying the NamedEntity with a complex query |
| 187 | 184 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Named entities filter > should aggregate named entities for ORGANIZATION category |
| 188 | 183 | tests/unit/specs/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri.spec.js > SearchBreadcrumbUri.vue > a simple query on one index with 2 filters on contentType > should parse the "cherry" index and show it first |
| 189 | 182 | tests/unit/specs/components/Settings/SettingsGeneral/SettingsGeneral.spec.js > SettingsGeneral > should render a form input for each setting |
| 190 | 182 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > contentType > should display an item for excluded filter |
| 191 | 181 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Search response > should filter documents if a named entity is selected |
| 192 | 181 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Named entities filter > should aggregate named entities for LOCATION category |
| 193 | 181 | tests/unit/specs/components/Login/LoginWelcome.spec.js > LoginWelcome.vue > should display a help link |
| 194 | 179 | tests/unit/specs/components/Project/ProjectForm.spec.js > ProjectForm.vue > without an existing project > should not validate the form group if an invalid URL for sourceUrl |
| 195 | 179 | tests/unit/specs/components/Project/ProjectForm.spec.js > ProjectForm.vue > with an existing project > should hide the sourcePath input |
| 196 | 176 | tests/unit/specs/components/PathTree/PathTree.spec.js > PathTree.vue > Posix > should not show a search bar |
| 197 | 175 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > contentType > should filter filter values on filter item |
| 198 | 173 | tests/unit/specs/components/Widget/WidgetDiskUsage.spec.js > WidgetDiskUsage.vue > should be a Vue instance |
| 199 | 172 | tests/unit/specs/components/Project/ProjectForm.spec.js > ProjectForm.vue > without an existing project > should not submit an invalid form without name |
| 200 | 172 | tests/unit/specs/components/Filter/FilterType/FilterTypeRecommendedBy.spec.js > FilterTypeRecommendedBy.vue > should sort options by decreasing order |
| 201 | 169 | tests/unit/specs/components/Filter/FilterType/FilterTypeRecommendedBy.spec.js > FilterTypeRecommendedBy.vue > should sort options to have the current user first |
| 202 | 168 | tests/unit/specs/components/Login/LoginWelcome.spec.js > LoginWelcome.vue > should display a sign-in link |
| 203 | 168 | tests/unit/specs/components/Display/DisplayEmail.spec.js > DisplayEmail.vue > renders the email address only |
| 204 | 167 | tests/unit/specs/views/Document/DocumentView/DocumentView.spec.js > DocumentView.vue > should call the retrieve the document and its parent |
| 205 | 167 | tests/unit/specs/views/Document/DocumentView/DocumentView.spec.js > DocumentView.vue > should call the API to retrieve document recommendations |
| 206 | 166 | tests/unit/specs/components/Project/ProjectForm.spec.js > ProjectForm.vue > without an existing project > should generate a slugified name when setting the label, respecting case |
| 207 | 165 | tests/unit/specs/router/guards.spec.js > guards > checkUserAuthentication > when the user is authenticated > should not redirect to /login when we have the right cookie |
| 208 | 164 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Search response > should find 3 documents filtered by two contentType |
| 209 | 164 | tests/unit/specs/components/Project/ProjectForm.spec.js > ProjectForm.vue > with an existing project > should initialize the form with default project values |
| 210 | 163 | tests/unit/specs/store/modules/document.spec.js > DocumentStore > should get the document's named entities |
| 211 | 162 | tests/unit/specs/components/VariantDropdown/VariantDropdown.spec.js > VariantDropdown.vue > defaults to the "info" option when no modelValue is provided |
| 212 | 161 | tests/unit/specs/views/Document/DocumentView/DocumentView.spec.js > DocumentView.vue > should display a document |
| 213 | 160 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Search response > should only search once when query is called concurrently with the same parameters |
| 214 | 159 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Should limit response size > should return 3 documents |
| 215 | 158 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Should limit response size > should return 1 document (1/3) |
| 216 | 158 | tests/unit/specs/components/Filter/FilterType/FilterTypeStarred.spec.js > FilterTypeStarred.vue > should change the selected value |
| 217 | 156 | tests/unit/specs/components/VariantDropdown/VariantDropdown.spec.js > VariantDropdown.vue > currentOption matches the "info" variant option |
| 218 | 156 | tests/unit/specs/components/Search/SearchBar/SearchBarInputDropdownForProjects.spec.js > SearchBarInputDropdownForProjects > is empty if project does not exists |
| 219 | 156 | tests/unit/specs/components/Project/ProjectForm.spec.js > ProjectForm.vue > without an existing project > should validate the form group if a valid URL for sourceUrl |
| 220 | 156 | tests/unit/specs/components/Project/ProjectForm.spec.js > ProjectForm.vue > without an existing project > should not validate the form group if an invalid URL for logoUrl |
| 221 | 156 | tests/unit/specs/components/Form/FormControl/FormControlTag/FormControltag.spec.js > FormControlTag > should remove a tag |
| 222 | 155 | tests/unit/specs/components/Widget/WidgetFieldFacets.spec.js > WidgetFieldFacets.vue > renders the component |
| 223 | 155 | tests/unit/specs/components/Project/ProjectForm.spec.js > ProjectForm.vue > without an existing project > should validate the form group if a valid URL for logoUrl |
| 224 | 155 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > contentType > should filter filter values on filter label in capital letters |
| 225 | 153 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshots.spec.js > SettingsSnapshots > when repository is not configured > should show setup component |
| 226 | 151 | tests/unit/specs/components/Login/LoginCard.spec.js > LoginCard.vue > should render a help link |
| 227 | 150 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Search response > should exclude documents with a specific contentType |
| 228 | 150 | tests/unit/specs/store/modules/document.spec.js > DocumentStore > should get the document |
| 229 | 150 | tests/unit/specs/components/Form/FormControl/FormControlTag/FormControltag.spec.js > FormControlTag > should not add duplicate tags if noDuplicates is true |
| 230 | 149 | tests/unit/specs/components/Document/DocumentThread/DocumentThread.spec.js > DocumentThread.vue > toggle expand > should not collapse the active email on toggle |
| 231 | 149 | tests/unit/specs/components/Document/DocumentThread/DocumentThread.spec.js > DocumentThread.vue > toggle expand > should expand a non-active email on toggle |
| 232 | 149 | tests/unit/specs/components/Document/DocumentThread/DocumentThread.spec.js > DocumentThread.vue > toggle expand > should display DocumentTranslation for the active email |
| 233 | 148 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > contentType > should display 3 items for the contentType filter alphabetically |
| 234 | 148 | tests/unit/specs/components/Document/DocumentDownloadPopover/DocumentDownloadPopover.spec.js > DocumentDownloadPopover.vue > should show the translation download button when document has translations |
| 235 | 146 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Should limit response size > should return 2 documents |
| 236 | 146 | tests/unit/specs/components/Project/ProjectForm.spec.js > ProjectForm.vue > without an existing project > should not submit an invalid form with a name but an invalid logoUrl |
| 237 | 146 | tests/unit/specs/components/Form/FormControl/FormControlTag/FormControltag.spec.js > FormControlTag > should remove the last tag if inputValueTrigger is empty |
| 238 | 146 | tests/unit/specs/components/AppSidebar/AppSidebar.spec.js > AppSidebar.vue > the logout link > should NOT be displayed if NOT in SERVER mode |
| 239 | 145 | tests/unit/specs/components/VariantDropdown/VariantDropdown.spec.js > VariantDropdown.vue > currentOption matches the "warning" variant option |
| 240 | 145 | tests/unit/specs/components/Form/FormControl/FormControlTag/FormControltag.spec.js > FormControlTag > should emit update:modelValue when addTag is called |
| 241 | 145 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > extractionLevel > should display the extraction level filter with correct labels in French |
| 242 | 145 | tests/unit/specs/components/Document/DocumentThread/DocumentThread.spec.js > DocumentThread.vue > toggle expand > should not expand a non-active email by default |
| 243 | 143 | tests/unit/specs/components/Project/ProjectForm.spec.js > ProjectForm.vue > without an existing project > should submit a valid form with a label |
| 244 | 142 | tests/unit/specs/views/Document/DocumentView/DocumentView.spec.js > DocumentView.vue > should call the API to add document to history |
| 245 | 142 | tests/unit/specs/main.spec.js > main > should instantiate Vue |
| 246 | 142 | tests/unit/specs/components/Document/DocumentContent.spec.js > DocumentContent.vue > the extracted text content > should sanitize the HTML in the extracted text |
| 247 | 141 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Search response > should return document from another project |
| 248 | 140 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Search response > should find documents after removing filter by contentType |
| 249 | 140 | tests/unit/specs/components/VariantDropdown/VariantDropdown.spec.js > VariantDropdown.vue > currentOption matches the "danger" variant option |
| 250 | 139 | tests/unit/specs/components/Login/LoginWelcome.spec.js > LoginWelcome.vue > should render the footer |
| 251 | 138 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > contentType > should display no items for the contentType filter |
| 252 | 138 | tests/unit/specs/api/elasticsearch.spec.js > elasticsearch > should sort by file name (reverse) |
| 253 | 137 | tests/unit/specs/components/AppSidebar/AppSidebar.spec.js > AppSidebar.vue > the logout link > should be displayed if in SERVER mode |
| 254 | 135 | tests/unit/specs/components/Search/SearchBar/SearchBarInput.spec.js > SearchBarInput.vue > should display search bar input |
| 255 | 135 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > contentType > should filter filter values on filter label |
| 256 | 135 | tests/unit/specs/api/elasticsearch.spec.js > elasticsearch > should sort by file name |
| 257 | 134 | tests/unit/specs/components/VariantDropdown/VariantDropdown.spec.js > VariantDropdown.vue > currentOption matches the "success" variant option |
| 258 | 133 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Content type filter > should create 3 buckets from 3 documents |
| 259 | 133 | tests/unit/specs/components/Document/DocumentThread/DocumentThread.spec.js > DocumentThread.vue > toggle expand > should collapse an expanded email on second toggle |
| 260 | 132 | tests/unit/specs/views/Document/DocumentView/DocumentView.spec.js > DocumentView.vue > should call the API to retrieve document tags |
| 261 | 131 | tests/unit/specs/components/Form/FormControl/FormControlTag/FormControltag.spec.js > FormControlTag > should split tags by separators |
| 262 | 130 | tests/unit/specs/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri.spec.js > SearchBreadcrumbUri.vue > a simple query on two indices > should parse all fields from the URI |
| 263 | 130 | tests/unit/specs/components/Filter/FilterType/FilterTypeRecommendedBy.spec.js > FilterTypeRecommendedBy.vue > should select no users |
| 264 | 130 | tests/unit/specs/components/Filter/FilterType/FilterTypeRecommendedBy.spec.js > FilterTypeRecommendedBy.vue > should load users who recommended documents in this project |
| 265 | 129 | tests/unit/specs/components/Widget/WidgetRecommendedBy.spec.js > WidgetRecommendedBy.vue > renders the component |
| 266 | 128 | tests/unit/specs/router/guards.spec.js > guards > checkMode > should not redirect task.documents.list to error in LOCAL mode |
| 267 | 128 | tests/unit/specs/components/VariantDropdown/VariantDropdown.spec.js > VariantDropdown.vue > shows the label of the current variant when showLabel is true |
| 268 | 128 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > language > should display the language filter in French |
| 269 | 127 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshots.spec.js > SettingsSnapshots > when repository is configured > should display repository information when snapshots exist |
| 270 | 125 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Content type filter > should count 2 pdf but have no hits |
| 271 | 125 | tests/unit/specs/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri.spec.js > SearchBreadcrumbUri.vue > a boolean query on one index > should parse the index and show it first |
| 272 | 123 | tests/unit/specs/components/Widget/WidgetDocuments.spec.js > WidgetDocuments.vue > should be a Vue instance |
| 273 | 122 | tests/unit/specs/components/Widget/WidgetDocumentsByCreationDate.spec.js > WidgetDocumentsByCreationDate.vue > with one valid creation date > should be a Vue instance |
| 274 | 122 | tests/unit/specs/components/Form/FormControl/FormControlTag/FormControltag.spec.js > FormControlTag > should validate a tag correctly |
| 275 | 121 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Search response > should not find documents after filtering by contentType |
| 276 | 121 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > contentType > should filter according to the others filters if contextualized search |
| 277 | 120 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Indexing date filter > should return the indexing date buckets |
| 278 | 119 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > contentType > should filter filter values - Uppercase situation |
| 279 | 117 | tests/unit/specs/components/Login/LoginCardForm.spec.js > LoginCardForm.vue > should render a form with username and password fields |
| 280 | 115 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > language > should translate any weird language |
| 281 | 114 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshots.spec.js > SettingsSnapshots > when repository is configured > should not show setup component when repository exists |
| 282 | 114 | tests/unit/specs/components/Filter/FilterType/FilterTypeDateRange.spec.js > FilterTypeDateRange.vue > has two inputs containing the date range |
| 283 | 113 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Content type filter > should count 2 documents of "type_01" and 1 document of "type_02" |
| 284 | 112 | tests/unit/specs/components/PageTable/PageTableGeneric.spec.js > PageTableGeneric.vue > should show empty table |
| 285 | 111 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Search response > should order documents by path |
| 286 | 111 | tests/unit/specs/components/Widget/WidgetDocumentsByCreationDate.spec.js > WidgetDocumentsByCreationDate.vue > with one valid creation date > should display a message if data are missing |
| 287 | 111 | tests/unit/specs/components/VariantDropdown/VariantDropdown.spec.js > VariantDropdown.vue > does not show the label by default |
| 288 | 109 | tests/unit/specs/store/modules/document.spec.js > DocumentStore > Manage tags > should tag multiple documents and not refresh and no document is selected in the store |
| 289 | 109 | tests/unit/specs/components/Document/DocumentViewer/DocumentViewerImage.spec.js > DocumentViewerImage.vue > should generate an image href containing with a base64 image |
| 290 | 108 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > language > should match language search case-insensitively |
| 291 | 108 | tests/unit/specs/components/Document/DocumentViewer/DocumentViewerTiff.spec.js > DocumentViewerTiff.vue > with a missing file > should display an error message if the document does not exist |
| 292 | 105 | tests/unit/specs/router/guards.spec.js > guards > checkMode > should not redirect project.new to error in LOCAL mode |
| 293 | 105 | tests/unit/specs/components/Dismissable/DismissableAlert.spec.js > DismissableAlert > renders with default warning variant |
| 294 | 102 | tests/unit/specs/store/modules/document.spec.js > DocumentStore > Manage tags > should tag multiple documents and not refresh |
| 295 | 102 | tests/unit/specs/store/modules/document.spec.js > DocumentStore > Manage tags > should call deleteTag from 1 document |
| 296 | 99 | tests/unit/specs/views/Login/Login.spec.js > Login.vue > should show the welcome layout by default |
| 297 | 98 | tests/unit/specs/views/Settings/SettingsView/SettingsViewSnapshots.spec.js > SettingsViewSnapshots > should fetch repository on mount |
| 298 | 97 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshots.spec.js > SettingsSnapshots > when repository is configured > should render the snapshots component |
| 299 | 96 | tests/unit/specs/components/Task/TaskEntities/TaskEntitiesForm.spec.js > TaskEntitiesForm.vue > should load NER pipelines on component mounted |
| 300 | 96 | tests/unit/specs/components/PageTable/PageTableGeneric.spec.js > PageTableGeneric.vue > should show row details for the first item but not the second |
| 301 | 95 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Creation date filter > should count only Document types and not the NamedEntities |
| 302 | 95 | tests/unit/specs/store/modules/document.spec.js > DocumentStore > Manage isRecommended status > should MARK these documents as recommended |
| 303 | 95 | tests/unit/specs/components/Task/TaskDocuments/TaskDocumentsFormOcrAlert.spec.js > TaskDocumentsFormOcrAlert.vue > OCR for italian language is not installed > should display an alert indicating that no OCR is installed for italian |
| 304 | 95 | tests/unit/specs/components/Settings/SettingsGeneral/SettingsGeneral.spec.js > SettingsGeneral > should exclude obfuscated settings from save payload |
| 305 | 95 | tests/unit/specs/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri.spec.js > SearchBreadcrumbUri.vue > a boolean query on one index > should parse the query and show it second |
| 306 | 95 | tests/unit/specs/components/Document/DocumentViewer/DocumentViewerPdf/DocumentViewerPdfNavDropdown/DocumentViewerPdfNavDropdownScale.spec.js > DocumentViewerPdfDropdownScale.vue > emits update:modelValue when clicking fit |
| 307 | 95 | tests/unit/specs/components/Document/DocumentGlobalSearchTerms.spec.js > DocumentGlobalSearchTerms.vue > lists the query terms but the ones about specific field other than "content" > should highlight the query terms with the same color than in the list |
| 308 | 94 | tests/unit/specs/store/modules/document.spec.js > DocumentStore > Manage isRecommended status > should UNMARK these documents as recommended |
| 309 | 94 | tests/unit/specs/components/Settings/SettingsGeneral/SettingsGeneral.spec.js > SettingsGeneral > should reset non-obfuscated fields to original values |
| 310 | 93 | tests/unit/specs/composables/useTaskSettings.spec.js > useTaskSettings > should initialize "app/task" settings with sort by to createdAt / desc |
| 311 | 93 | tests/unit/specs/components/PathTree/PathTreeBreadcrumb/PathTreeBreadcrumb.spec.js > PathTreeBreadcrumb.vue > should be a Vue instance |
| 312 | 90 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > pageless behavior (pagelessBucketSize option) > requests `pagelessBucketSize` buckets in one page |
| 313 | 88 | tests/unit/specs/components/Search/SearchBar/SearchBar.spec.js > SearchBar.vue > should display search bar |
| 314 | 87 | tests/unit/specs/main.spec.js > main > should set the config |
| 315 | 87 | tests/unit/specs/components/Document/DocumentGlobalSearchTerms.spec.js > DocumentGlobalSearchTerms.vue > lists the query terms but the ones about specific field other than "content" > should display query terms in tags with specific message and in last position |
| 316 | 85 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Query within NamedEntity > should not find document on querying the NamedEntity if it isnt in its content |
| 317 | 84 | tests/unit/specs/views/Settings/SettingsView/SettingsViewSnapshots.spec.js > SettingsViewSnapshots > should fetch snapshots when repository exists |
| 318 | 83 | tests/unit/specs/views/Settings/SettingsView/SettingsViewSnapshots.spec.js > SettingsViewSnapshots > should render the snapshots settings view |
| 319 | 83 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Content type filter > should count 2 documents of type "type_01" |
| 320 | 82 | tests/unit/specs/store/modules/document.spec.js > DocumentStore > Manage tags > should get the document's tags |
| 321 | 82 | tests/unit/specs/components/Document/DocumentGlobalSearchTerms.spec.js > DocumentGlobalSearchTerms.vue > lists the query terms but the ones about specific field other than "content" > should not display the negative query terms |
| 322 | 81 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Query within NamedEntity > should find document on querying the NamedEntity |
| 323 | 81 | tests/unit/specs/components/PageHeader/PageHeaderNav.spec.js > PageHeaderNav.vue > should display a navigation-breadcrumb by default |
| 324 | 80 | tests/unit/specs/components/VariantDropdown/VariantDropdown.spec.js > VariantDropdown.vue > teleports the menu to body |
| 325 | 80 | tests/unit/specs/components/Filter/FilterType/FilterTypePath.spec.js > FilterTypePath.vue > should reset the selected paths when project change |
| 326 | 80 | tests/unit/specs/components/BatchDownload/BatchDownloadActions.spec.js > BatchDownloadActions.vue > relaunchTask method > should emit a refresh when the relaunch is done |
| 327 | 79 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsCreate.spec.js > SettingsSnapshotsCreate > should render the create button |
| 328 | 79 | tests/unit/specs/components/Settings/SettingsGeneral/SettingsGeneral.spec.js > SettingsGeneral > should detect changes only on non-obfuscated fields |
| 329 | 78 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshots.spec.js > SettingsSnapshots > when repository is not configured > should not show snapshots list |
| 330 | 78 | tests/unit/specs/components/Filter/FilterType/FilterTypePath.spec.js > FilterTypePath.vue > should be created with dataDir as path |
| 331 | 77 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshots.spec.js > SettingsSnapshots > when repository is configured > should display the delete repository button |
| 332 | 77 | tests/unit/specs/components/Project/ProjectDeletionModal.spec.js > ProjectDeletionModal.vue > deletes the project when the model emits a ok event |
| 333 | 76 | tests/unit/specs/composables/useNProgress.spec.js > useNProgress > should create a progress bar after `start` is called |
| 334 | 75 | tests/unit/specs/components/Task/TaskBatchSearch/TaskBatchSearchForm.spec.js > TaskBatchSearchForm > shows a success toast when batch search is created |
| 335 | 75 | tests/unit/specs/components/PathBanner/PathBannersListEntry.spec.js > PathBannersListEntry.vue > renders the banner note |
| 336 | 75 | tests/unit/specs/components/Document/DocumentGlobalSearchTerms.spec.js > DocumentGlobalSearchTerms.vue > lists the query terms but the ones about specific field other than "content" > should not display the query terms on a specific field but content |
| 337 | 74 | tests/unit/specs/views/Settings/SettingsView/SettingsViewApi.spec.js > SettingsViewApi > should display no keys by default |
| 338 | 74 | tests/unit/specs/store/modules/document.spec.js > DocumentStore > Manage isRecommended status > should retrieve the list of users who recommended it and set it to the store |
| 339 | 74 | tests/unit/specs/components/VariantDropdown/VariantDropdown.spec.js > VariantDropdown.vue > button content icon has the class matching the current variant |
| 340 | 73 | tests/unit/specs/components/Project/ProjectJumbotron/ProjectJumbotron.spec.js > ProjectJumbotron.vue > should render without errors |
| 341 | 73 | tests/unit/specs/components/BatchDownload/BatchDownloadConfirmModal.spec.js > BatchDownloadConfirmModal.vue > renders the known-truncation variant when both estimates are provided |
| 342 | 72 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Content type filter > should use contentType (without charset) |
| 343 | 72 | tests/unit/specs/components/Task/Task.spec.js > Task.vue > renders correctly |
| 344 | 72 | tests/unit/specs/components/Filter/FilterType/FilterTypePath.spec.js > FilterTypePath.vue > should list selected paths according to the filter |
| 345 | 71 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBannersModal.spec.js > ProjectViewEditPathBannersModal.vue > navigates back when cancel is called |
| 346 | 71 | tests/unit/specs/components/Search/SearchBar/SearchBar.spec.js > SearchBar.vue > should submit search |
| 347 | 71 | tests/unit/specs/components/Display/DisplaySnapshotRepositoryType.spec.js > DisplaySnapshotRepositoryType > should render the component |
| 348 | 70 | tests/unit/specs/components/Task/TaskEntities/TaskEntitiesForm.spec.js > TaskEntitiesForm.vue > should call findNames action with CORENLP pipeline, by default |
| 349 | 70 | tests/unit/specs/components/Form/FormControl/FormControlTag/FormControltag.spec.js > FormControlTag > should compute class list correctly |
| 350 | 70 | tests/unit/specs/components/Form/FormControl/FormControlExtractingLanguage.spec.js > FormControlExtractingLanguage.vue > Has languages available > should have default as first option |
| 351 | 69 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > fetchSnapshots > should fetch snapshots and update state |
| 352 | 68 | tests/unit/specs/components/Filter/FilterType/FilterType.spec.js > FilterType.vue > pageless behavior (pagelessBucketSize option) > does not render the infinite-loading component |
| 353 | 67 | tests/unit/specs/components/Search/SearchParameter/SearchParameterQueryAst.spec.js > SearchParameterQueryAst.vue > operator display > shows OR operator between terms when ast.operator is implicit and store defaults to OR |
| 354 | 67 | tests/unit/specs/components/PathBanner/PathBannerForm.spec.js > PathBannerForm.vue > emits "save" with form data when submit() is called |
| 355 | 65 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Search response > should return document from local project |
| 356 | 65 | tests/unit/specs/components/Widget/WidgetFieldFacets.spec.js > WidgetFieldFacets.vue > loads a page of data |
| 357 | 65 | tests/unit/specs/components/Display/DisplayUser.spec.js > DisplayUser.vue > should display "foo" |
| 358 | 64 | tests/unit/specs/composables/useSearchFilter.spec.js > useSearchFilter > watchOperator > calls callback when search operator changes from OR to AND |
| 359 | 64 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsActions.spec.js > SettingsSnapshotsActions > should render the actions component |
| 360 | 63 | tests/unit/specs/views/Settings/SettingsView/SettingsViewSnapshots.spec.js > SettingsViewSnapshots > should display the settings snapshots component |
| 361 | 63 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBannersModal.spec.js > ProjectViewEditPathBannersModal.vue > save > navigates back after a successful save |
| 362 | 63 | tests/unit/specs/components/Widget/WidgetDocumentsByCreationDate.spec.js > WidgetDocumentsByCreationDate.vue > with one valid creation date > should display no message if no data are missing |
| 363 | 63 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshots.spec.js > SettingsSnapshots > when repository is configured > should pass isLoading to child components |
| 364 | 63 | tests/unit/specs/components/PageTable/PageTableGeneric.spec.js > PageTableGeneric.vue > should have one sortable header |
| 365 | 62 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBannersModal.spec.js > ProjectViewEditPathBannersModal.vue > modal is closed when route has no bannerId |
| 366 | 61 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBannersModal.spec.js > ProjectViewEditPathBannersModal.vue > save > shows a "Banner created." toast when creating a new banner |
| 367 | 61 | tests/unit/specs/store/modules/document.spec.js > DocumentStore > Manage isRecommended status > should sort users by alphabetical order of id |
| 368 | 61 | tests/unit/specs/components/Settings/SettingsGeneral/SettingsGeneral.spec.js > SettingsGeneral > should include all non-obfuscated settings in save payload |
| 369 | 61 | tests/unit/specs/components/Form/FormControl/FormControlExtractingLanguage.spec.js > FormControlExtractingLanguage.vue > When a fetching error occurs > should display a message when text languages is rejected |
| 370 | 60 | tests/unit/specs/components/Search/SearchBar/SearchBarInput.spec.js > SearchBarInput.vue > should disable submit button when disableSubmit is true |
| 371 | 60 | tests/unit/specs/components/Form/FormControl/FormControlExtractingLanguage.spec.js > FormControlExtractingLanguage.vue > Has languages available > should use the correct label for CHINESE |
| 372 | 59 | tests/unit/specs/views/Settings/SettingsView/SettingsViewSnapshots.spec.js > SettingsViewSnapshots > should display setup when repository does not exist |
| 373 | 59 | tests/unit/specs/components/PageTable/PageTableGeneric.spec.js > PageTableGeneric.vue > should show table with 2 tasks and one column "name" |
| 374 | 58 | tests/unit/specs/components/Widget/WidgetDocumentsByCreationDateByPath.spec.js > WidgetDocumentsByCreationDateByPath.vue > should be a Vue instance |
| 375 | 58 | tests/unit/specs/components/Filter/FilterType/FilterTypePath.spec.js > FilterTypePath.vue > should pre-open ancestor directories of selected paths |
| 376 | 57 | tests/unit/specs/views/Login/Login.spec.js > Login.vue > when authFilter is FormAuthFilter > should show the card layout |
| 377 | 57 | tests/unit/specs/store/modules/document.spec.js > DocumentStore > Manage tags > should add tags to the store |
| 378 | 57 | tests/unit/specs/components/Widget/WidgetFieldFacets.spec.js > WidgetFieldFacets.vue > has the correct class |
| 379 | 56 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBannersModal.spec.js > ProjectViewEditPathBannersModal.vue > save > shows an error toast on failed update |
| 380 | 56 | tests/unit/specs/views/Project/ProjectList/ProjectList.spec.js > ProjectList.vue > returns no projects when search query matches nothing |
| 381 | 56 | tests/unit/specs/components/PageTable/PageTableGeneric.spec.js > PageTableGeneric.vue > should show table with 2 tasks and columns "id" and "name" |
| 382 | 55 | tests/unit/specs/store/modules/search.spec.js > SearchStore > With multiple filter values > should merge filter values with several other values |
| 383 | 55 | tests/unit/specs/components/Widget/WidgetRecommendedBy.spec.js > WidgetRecommendedBy.vue > has the correct class |
| 384 | 55 | tests/unit/specs/components/PageTable/PageTableGeneric.spec.js > PageTableGeneric.vue > should render correctly |
| 385 | 55 | tests/unit/specs/components/Form/FormControl/FormControlExtractingLanguage.spec.js > FormControlExtractingLanguage.vue > Has languages available > should use the correct label for ENGLISH |
| 386 | 55 | tests/unit/specs/components/Dismissable/DismissableAlertEditable.spec.js > DismissableAlertEditable.vue > renders a DismissableAlert |
| 387 | 54 | tests/unit/specs/views/Project/ProjectList/ProjectList.spec.js > ProjectList.vue > filters projects by name |
| 388 | 54 | tests/unit/specs/composables/useElementObserver.spec.js > useElementObserver > rejects if element not created within timeout |
| 389 | 54 | tests/unit/specs/components/Widget/WidgetRecommendedBy.spec.js > WidgetRecommendedBy.vue > loads a page of data, including ElasticSearch document |
| 390 | 54 | tests/unit/specs/components/Task/TaskDocuments/TaskDocumentsForm.spec.js > TaskDocumentsForm.vue > should call extract action without OCR option on default project, by default |
| 391 | 54 | tests/unit/specs/components/JsonFormatter.spec.js > JsonFormatter.vue > should render an array of 1 element |
| 392 | 54 | tests/unit/specs/components/Form/FormControl/FormControlExtractingLanguage.spec.js > FormControlExtractingLanguage.vue > Has languages available > should use the correct label for FRENCH |
| 393 | 53 | tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabs.spec.js > DocumentViewTabs.vue > should display the component |
| 394 | 53 | tests/unit/specs/composables/useElementObserver.spec.js > useElementObserver > rejects if element not destroyed within timeout |
| 395 | 53 | tests/unit/specs/components/Project/ProjectLink.spec.js > ProjectLink.vue > should display the label of the project |
| 396 | 53 | tests/unit/specs/components/PageTable/PageTableGeneric.spec.js > PageTableGeneric.vue > should show table with 2 tasks |
| 397 | 53 | tests/unit/specs/components/Login/LoginCardForm.spec.js > LoginCardForm.vue > should render a submit button |
| 398 | 53 | tests/unit/specs/components/Filter/FilterType/FilterTypePath.spec.js > FilterTypePath.vue > should preserve manually opened paths when selected paths change |
| 399 | 53 | tests/unit/specs/components/Dismissable/DismissableToastBody.spec.js > DismissableToastBody > renders with default variant when toastProps type is not provided |
| 400 | 53 | tests/unit/specs/components/BatchDownload/BatchDownloadTruncatedAlert.spec.js > BatchDownloadTruncatedAlert.vue > displays the FILE_COUNT_LIMIT message with bold reason and formatted file count |
| 401 | 52 | tests/unit/specs/components/Settings/SettingsGeneral/SettingsGeneral.spec.js > SettingsGeneral > should disable inputs for obfuscated settings |
| 402 | 51 | tests/unit/specs/views/Project/ProjectList/ProjectList.spec.js > ProjectList.vue > filters projects by label |
| 403 | 51 | tests/unit/specs/views/Project/ProjectList/ProjectList.spec.js > ProjectList.vue > filters projects by description |
| 404 | 51 | tests/unit/specs/components/Project/ProjectThumbnail.spec.js > ProjectThumbnail.vue > should display a colored thumbnail |
| 405 | 50 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBannersModal.spec.js > ProjectViewEditPathBannersModal.vue > save > shows an error toast on failed create |
| 406 | 50 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBannersModal.spec.js > ProjectViewEditPathBannersModal.vue > save > calls savePathBanner API on save |
| 407 | 50 | tests/unit/specs/components/Document/DocumentContent.spec.js > DocumentContent.vue > the extracted text content > should not sanitize the <mark /> tags in the extracted text |
| 408 | 49 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBannersModal.spec.js > ProjectViewEditPathBannersModal.vue > save > shows a "Banner saved." toast when updating an existing banner |
| 409 | 49 | tests/unit/specs/core/HooksMixin.spec.js > HooksMixin > should find several hooked components by their target name |
| 410 | 49 | tests/unit/specs/components/Widget/WidgetDocumentsByCreationDate.spec.js > WidgetDocumentsByCreationDate.vue > with 3 valid creation date > should change the value of the selectedInterval and reload data |
| 411 | 49 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsList.spec.js > SettingsSnapshotsList > should render the list component |
| 412 | 49 | tests/unit/specs/components/Project/ProjectThumbnail.spec.js > ProjectThumbnail.vue > should not display a colored thumbnail |
| 413 | 49 | tests/unit/specs/components/PathTree/PathTreeBreadcrumb/PathTreeBreadcrumb.spec.js > PathTreeBreadcrumb.vue > should display 3 entries with Windows pathSeparator |
| 414 | 49 | tests/unit/specs/components/Document/DocumentViewer/DocumentViewerPdf/DocumentViewerPdfNavDropdown/DocumentViewerPdfNavDropdownRotationCounterClockwise.spec.js > RotateCounterClockwiseButton.vue > renders the button correct label |
| 415 | 49 | tests/unit/specs/components/Display/DisplaySnapshotVersion.spec.js > DisplaySnapshotVersion > should render the component |
| 416 | 49 | tests/unit/specs/components/Dismissable/DismissableContentWarningToggler.spec.js > DismissableContentWarningToggler.vue > renders the default title |
| 417 | 48 | tests/unit/specs/components/PageTable/PageTableGeneric.spec.js > PageTableGeneric.vue > should show row details for the second item but not the first |
| 418 | 48 | tests/unit/specs/components/PageTable/PageTableGeneric.spec.js > PageTableGeneric.vue > should show all rows details |
| 419 | 48 | tests/unit/specs/components/Mode/ModeServerOnly.spec.js > ModeServerOnly.vue > when the initial mode is `SERVER` > should display "foo" |
| 420 | 47 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsSetup.spec.js > SettingsSnapshotsSetup > paths available state > should display the title |
| 421 | 47 | tests/unit/specs/components/Document/DocumentContent.spec.js > DocumentContent.vue > search term > with 1 occurrence > should not sticky the toolbox by default |
| 422 | 47 | tests/unit/specs/components/Dismissable/DismissableAlert.spec.js > DismissableAlert > dismisses the alert when button is clicked |
| 423 | 46 | tests/unit/specs/components/Task/TaskDocuments/TaskDocumentsFormOcrAlert.spec.js > TaskDocumentsFormOcrAlert.vue > OCR for french language is installed > should not display an alert indicating that no OCR is installed for french |
| 424 | 46 | tests/unit/specs/components/PathBanner/PathBannerForm.spec.js > PathBannerForm.vue > resets local form when the banner prop changes |
| 425 | 46 | tests/unit/specs/components/BatchDownload/BatchDownloadTruncatedAlert.spec.js > BatchDownloadTruncatedAlert.vue > displays the SIZE_LIMIT message with bold reason and formatted size |
| 426 | 45 | tests/unit/specs/core/PipelinesMixin.spec.js > PipelinesMixin > should find several pipeline by their category |
| 427 | 45 | tests/unit/specs/components/PathTree/PathTreeBreadcrumb/PathTreeBreadcrumb.spec.js > PathTreeBreadcrumb.vue > should display 2 entries |
| 428 | 45 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntry.spec.js > DocumentThreadEntry.vue > should show DocumentTranslation when expanded |
| 429 | 44 | tests/unit/specs/store/modules/search.spec.js > SearchStore > With excluded filter > should take into reverse a filter and not the others |
| 430 | 44 | tests/unit/specs/core/Core.spec.js > Core > Call useAll on Core > should expose the router |
| 431 | 44 | tests/unit/specs/components/Search/SearchBar/SearchBar.spec.js > SearchBar.vue > should reset the from search parameter to 0 |
| 432 | 43 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > delete > asks for confirmation before deleting |
| 433 | 43 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Delete query terms > should delete 1 simple negative query term |
| 434 | 43 | tests/unit/specs/composables/useSearchFilter.spec.js > useSearchFilter > refreshSearchFromRoute > restores searchOperator from route query to app settings |
| 435 | 43 | tests/unit/specs/components/Project/ProjectJumbotron/ProjectJumbotron.spec.js > ProjectJumbotron.vue > DisplayRole in server mode > shows the role from policies for the current project |
| 436 | 43 | tests/unit/specs/components/Project/ProjectCard/ProjectCardFooter.spec.js > ProjectCardFooter.vue > should render without errors |
| 437 | 43 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryHeaderFrom.spec.js > DocumentThreadEntryHeaderFrom.vue > should render a DisplayEmail component |
| 438 | 42 | tests/unit/specs/composables/useTaskPolling.spec.js > useTaskPolling > should not send args.batchRecord.name filter when searchQuery is empty |
| 439 | 42 | tests/unit/specs/composables/useKeyboardShortcuts.spec.js > useKeyboardShortcuts > should get no route shortcuts for the initial route |
| 440 | 42 | tests/unit/specs/components/BatchSearch/BatchSearchActions.spec.js > BatchSearchActions.vue > with a successful task > should display a non-disabled button to relaunch the batchSearch |
| 441 | 41 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > delete > removes the banner from the list after confirmed deletion |
| 442 | 41 | tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js > DocumentViewTabsViewer.vue > should call the DocumentViewerLegacySpreadsheet component for XLSX document |
| 443 | 41 | tests/unit/specs/composables/useDocumentDownload.spec.js > useDocumentDownload composable > fetchStatuses > should not fetch download status when immediate is false |
| 444 | 41 | tests/unit/specs/components/Search/SearchBar/SearchBar.spec.js > SearchBar.vue > should not display the shortkeys-modal component |
| 445 | 41 | tests/unit/specs/components/PageTable/PageTableGeneric.spec.js > PageTableGeneric.vue > should have one emphasis header |
| 446 | 41 | tests/unit/specs/components/Document/DocumentContent.spec.js > DocumentContent.vue > the extracted text content > should display "No content extracted for this document" and disable the search input when the extracted text is empty |
| 447 | 40 | tests/unit/specs/store/modules/starred.spec.js > StarredStore > should not reset the starredDocuments from the filter |
| 448 | 40 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Delete query terms > should delete "AND" boolean operator on first applied filter deletion, if any |
| 449 | 40 | tests/unit/specs/composables/useWait.spec.js > useWait composable > computes isLoading correctly and waiting returns the proper state |
| 450 | 40 | tests/unit/specs/components/Task/TaskDocuments/TaskDocumentsForm.spec.js > TaskDocumentsForm.vue > should call extract action selected language "fra" |
| 451 | 40 | tests/unit/specs/components/Task/TaskActions.spec.js > Task Actions > renders correctly |
| 452 | 40 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsSetup.spec.js > SettingsSnapshotsSetup > should render the setup component |
| 453 | 40 | tests/unit/specs/components/Search/SearchParameter/SearchParameterQueryAst.spec.js > SearchParameterQueryAst.vue > operator display > shows AND operator between terms when ast.operator is implicit and store is set to AND |
| 454 | 40 | tests/unit/specs/components/PageHeader/PageHeaderToolbar.spec.js > PageHeaderToolbar.vue > should NOT display a form-control-search by default |
| 455 | 40 | tests/unit/specs/components/Document/DocumentGlobalSearchTermsEntry.spec.js > DocumentGlobalSearchTermsEntry > renders without crashing |
| 456 | 39 | tests/unit/specs/router/guards.spec.js > guards > checkUserRole > should allow access to project.view.edit when user has ADMIN role |
| 457 | 39 | tests/unit/specs/composables/useNProgress.spec.js > useNProgress > should not create a progress bar by default |
| 458 | 39 | tests/unit/specs/components/PageTable/PageTableGeneric.spec.js > PageTableGeneric.vue > should not show any row details |
| 459 | 39 | tests/unit/specs/components/Document/DocumentViewer/DocumentViewerPdf/DocumentViewerPdfNavDropdown/DocumentViewerPdfNavDropdownRotationClockwise.spec.js > RotateClockwiseButton.vue > renders the button correct label |
| 460 | 39 | tests/unit/specs/components/Display/DisplayEsDistribution.spec.js > DisplayEsDistribution > should render the component |
| 461 | 38 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBannersModal.spec.js > ProjectViewEditPathBannersModal.vue > save > emits banner:save after a successful save |
| 462 | 38 | tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabs.spec.js > DocumentViewTabs.vue > should display 4 entries: text, viewer, metadata and entities |
| 463 | 38 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Should limit response size > should return 0 documents in total |
| 464 | 38 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Delete query terms > should delete all occurrences of the term from the query |
| 465 | 38 | tests/unit/specs/main.spec.js > main > when configure fails with a 401 > should delete the session cookie on auth reset |
| 466 | 38 | tests/unit/specs/components/Widget/WidgetListGroup.spec.js > WidgetListGroup.vue > should be a Vue instance |
| 467 | 38 | tests/unit/specs/components/Widget/WidgetEmpty.spec.js > WidgetEmpty.vue > should be a Vue instance |
| 468 | 38 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshots.spec.js > SettingsSnapshots > when repository is configured > should hide repository information when no snapshots |
| 469 | 38 | tests/unit/specs/components/BatchDownload/BatchDownloadActions.spec.js > BatchDownloadActions.vue > relaunchTask method > should call the API with a parsed query |
| 470 | 37 | tests/unit/specs/store/modules/search.spec.js > SearchStore > With multiple filter values > should add a filter value only once |
| 471 | 37 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Suffixed store > should return the same store |
| 472 | 37 | tests/unit/specs/components/Widget/WidgetDocumentsByCreationDate.spec.js > WidgetDocumentsByCreationDate.vue > with 3 valid creation date > should display 2 selectors |
| 473 | 37 | tests/unit/specs/components/PathTree/PathTreeBreadcrumb/PathTreeBreadcrumb.spec.js > PathTreeBreadcrumb.vue > should display 3 entries |
| 474 | 37 | tests/unit/specs/components/PageTable/PageTableGeneric.spec.js > PageTableGeneric.vue > should not have sortable headers |
| 475 | 37 | tests/unit/specs/components/Display/DisplaySnapshotDistribution.spec.js > DisplaySnapshotDistribution > should render the component |
| 476 | 36 | tests/unit/specs/views/Project/ProjectView/ProjectViewEdit/ProjectViewEdit.spec.js > ProjectViewEdit.vue > renders two tab navigation entries |
| 477 | 36 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > renders an "Add banner" button |
| 478 | 36 | tests/unit/specs/components/PathBanner/PathBannersList.spec.js > PathBannersList.vue > shows the EmptyState component when banners is empty |
| 479 | 36 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryHeaderCreationDate.spec.js > DocumentThreadEntryHeaderCreationDate.vue > should render a router-link when creationDate exists |
| 480 | 36 | tests/unit/specs/components/BatchDownload/BatchDownloadActions.spec.js > BatchDownloadActions.vue > search link > should route to the search with query params from the stored uri |
| 481 | 35 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > store invalidation > syncs the path banners store after a successful delete |
| 482 | 35 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > populates banners from API response |
| 483 | 35 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshots.spec.js > SettingsSnapshots > when repository is configured > should display the title |
| 484 | 35 | tests/unit/specs/components/Search/SearchParameter/SearchParameterQueryAst.spec.js > SearchParameterQueryAst.vue > operator display > shows explicit AND operator regardless of store setting |
| 485 | 35 | tests/unit/specs/components/PageTable/PageTableGeneric.spec.js > PageTableGeneric.vue > should updates visible columns |
| 486 | 35 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryHeaderToggler.spec.js > DocumentThreadEntryHeaderToggler.vue > should render the toggler element |
| 487 | 35 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryHeader.spec.js > DocumentThreadEntryHeader.vue > should emit toggle on click |
| 488 | 35 | tests/unit/specs/components/BatchDownload/BatchDownloadTruncatedAlert.spec.js > BatchDownloadTruncatedAlert.vue > does not render when truncationReason is null |
| 489 | 34 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBannersModal.spec.js > ProjectViewEditPathBannersModal.vue > uses a default empty banner for the new route |
| 490 | 34 | tests/unit/specs/views/Login/Login.spec.js > Login.vue > when authFilter is FormAuthFilter > should not show the welcome layout |
| 491 | 34 | tests/unit/specs/store/modules/search.spec.js > SearchStore > With multiple filter values > should add filter with several values |
| 492 | 34 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Delete query terms > should not delete the term from the query if it doesn't exist |
| 493 | 34 | tests/unit/specs/composables/useUrlParam.spec.js > useUrlParam > should sync a single query parameter with the initial value |
| 494 | 34 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsSetup.spec.js > SettingsSnapshotsSetup > paths available state > should display the form |
| 495 | 34 | tests/unit/specs/components/PathBanner/PathBannerForm.spec.js > PathBannerForm.vue > variant and sensitive content fields > does not render the VariantDropdown when blurSensitiveMedia is true |
| 496 | 34 | tests/unit/specs/components/PageTable/PageTableGeneric.spec.js > PageTableGeneric.vue > should not have emphasis headers |
| 497 | 34 | tests/unit/specs/components/Filter/FilterType/FilterTypeAll.spec.js > FilterTypeAll.vue > renders the filter entry |
| 498 | 34 | tests/unit/specs/components/Document/DocumentContent.spec.js > DocumentContent.vue > the extracted text content > should NOT display the text right to left for english |
| 499 | 34 | tests/unit/specs/components/Document/DocumentContent.spec.js > DocumentContent.vue > the extracted text content > should display the text right to left for arabic |
| 500 | 33 | tests/unit/specs/views/Settings/SettingsView/SettingsViewSnapshots.spec.js > SettingsViewSnapshots > should not fetch snapshots when repository does not exist |
| 501 | 33 | tests/unit/specs/views/Login/Login.spec.js > Login.vue > when authFilter is FormAuthFilter > should use the form-auth modifier class |
| 502 | 33 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Reset state > should change the state after "query" mutation |
| 503 | 33 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Build route query > should reset the values of a filter |
| 504 | 33 | tests/unit/specs/components/Task/TaskBatchSearch/TaskBatchSearchForm.spec.js > TaskBatchSearchForm > shows an error toast when batch search creation fails |
| 505 | 33 | tests/unit/specs/components/Search/SearchBar/SearchBar.spec.js > SearchBar.vue > should submit the from with a different index |
| 506 | 33 | tests/unit/specs/components/Form/FormControl/FormControlSearch/FormControlSearch.spec.js > FormControlSearch > renders without crashing |
| 507 | 33 | tests/unit/specs/components/Dismissable/DismissableAlert.spec.js > DismissableAlert > renders with provided variant |
| 508 | 33 | tests/unit/specs/components/BatchDownload/BatchDownloadActions.spec.js > BatchDownloadActions.vue > relaunchTask method > should call the API with a list of projects |
| 509 | 32 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Suffixed store > should create twice the same store with an id different than the default search store |
| 510 | 32 | tests/unit/specs/store/modules/search.spec.js > SearchStore > runBatchDownload > passes the search operator to the elasticsearch query |
| 511 | 32 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Delete query terms > should delete "OR" boolean operator on first applied filter deletion, if any |
| 512 | 32 | tests/unit/specs/main.spec.js > main > should find several hooked components by their target name |
| 513 | 32 | tests/unit/specs/core/FiltersMixin.spec.js > FiltersMixin > register an email mixin |
| 514 | 32 | tests/unit/specs/composables/useBatchDownloadEstimation.spec.js > useBatchDownloadEstimation composable > initialises estimatedCount and estimatedSize to 0 and loading to false |
| 515 | 32 | tests/unit/specs/composables/refWhenever.spec.js > refWhenever > should initialize triggered to false |
| 516 | 32 | tests/unit/specs/components/Widget/WidgetText.spec.js > WidgetText.vue > should be a Vue instance |
| 517 | 32 | tests/unit/specs/components/Widget/WidgetDocumentsByCreationDate.spec.js > WidgetDocumentsByCreationDate.vue > with 3 valid creation date > should give the correct search query params for a date |
| 518 | 32 | tests/unit/specs/components/Task/TaskActions.spec.js > Task Actions > does not emit stop-pending when there is no pending tasks |
| 519 | 32 | tests/unit/specs/components/Search/SearchParameter/SearchParameterQueryAst.spec.js > SearchParameterQueryAst.vue > operator display > shows explicit OR operator regardless of store setting |
| 520 | 32 | tests/unit/specs/components/Document/DocumentViewer/DocumentViewerPdf/DocumentViewerPdfNavDropdown/DocumentViewerPdfNavDropdownScale.spec.js > DocumentViewerPdfDropdownScale.vue > emits update:modelValue when clicking width |
| 521 | 32 | tests/unit/specs/components/Display/DisplayUser.spec.js > DisplayUser.vue > should display "bar" |
| 522 | 31 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > openCreateModal pushes to banners/new route |
| 523 | 31 | tests/unit/specs/core/I18nMixin.spec.js > I18nMixin > with german language in local storage > should use "de" as default language |
| 524 | 31 | tests/unit/specs/composables/useSearchFilter.spec.js > useSearchFilter > refreshSearchFromRoute > ignores invalid searchOperator values from route query |
| 525 | 31 | tests/unit/specs/components/PageHeader/PageHeaderNav.spec.js > PageHeaderNav.vue > should NOT  display a navigation-breadcrumb when `noBreadcrumb` is true |
| 526 | 31 | tests/unit/specs/components/Document/DocumentViewer/DocumentViewerPdf/DocumentViewerPdfNavDropdown/DocumentViewerPdfNavDropdownRotationCounterClockwise.spec.js > RotateCounterClockwiseButton.vue > emits update:modelValue with the next rotation (default start) |
| 527 | 31 | tests/unit/specs/components/Document/DocumentViewer/DocumentViewerPdf/DocumentViewerPdfNavDropdown/DocumentViewerPdfNavDropdownRotationClockwise.spec.js > RotateClockwiseButton.vue > emits update:modelValue with the next rotation (default start) |
| 528 | 31 | tests/unit/specs/components/Display/DisplayUserAvatar.spec.js > DisplayUserAvatar.vue > should not display an avatar with an URL |
| 529 | 30 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > delete > calls deletePathBanner API when user confirms |
| 530 | 30 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBannersModal.spec.js > ProjectViewEditPathBannersModal.vue > uses the banner prop for the edit route |
| 531 | 30 | tests/unit/specs/store/modules/search.spec.js > SearchStore > With multiple filter values > should add a filter value only once even if numbers |
| 532 | 30 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Sort filter > this filter should sort language by _count once |
| 533 | 30 | tests/unit/specs/store/modules/recommended.spec.js > RecommendedStore > should init documents to an empty array |
| 534 | 30 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsSetup.spec.js > SettingsSnapshotsSetup > paths available state > should emit submit event with selected path when form is submitted |
| 535 | 30 | tests/unit/specs/components/Settings/SettingsGeneral/SettingsGeneral.spec.js > SettingsGeneral > should not disable inputs for non-obfuscated settings |
| 536 | 30 | tests/unit/specs/components/Form/FormFieldset/FormFieldset.spec.js > FormFieldset.vue > compact prop override > passes description to BFormGroup when compact=true |
| 537 | 30 | tests/unit/specs/components/Form/FormControl/FormControlSearch/FormControlSearch.spec.js > FormControlSearch > update input value |
| 538 | 30 | tests/unit/specs/components/Document/DocumentPathBanners.spec.js > DocumentPathBanners.vue > should display path banner on document |
| 539 | 30 | tests/unit/specs/components/Display/DisplayUser.spec.js > DisplayUser.vue > should display "local (you)" |
| 540 | 30 | tests/unit/specs/components/BatchDownload/BatchDownloadActions.spec.js > BatchDownloadActions.vue > removeTask method > should emit a refresh when the delete |
| 541 | 30 | tests/unit/specs/api/elasticsearch.spec.js > elasticsearch > should return backend response to a POST request for searchDocs |
| 542 | 29 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > pathHash > returns a non-empty string |
| 543 | 29 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Delete query terms > should delete a term from a complex query |
| 544 | 29 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Build route query > updateFromRouteQuery should restore search state from url > should RESET the from of the store according to the url |
| 545 | 29 | tests/unit/specs/store/modules/recommended.spec.js > RecommendedStore > should set the list of documents recommended by a list of users |
| 546 | 29 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should create a store that is persisted in pinia registry even after component is unmounted |
| 547 | 29 | tests/unit/specs/main.spec.js > main > should unregister all components on a hook |
| 548 | 29 | tests/unit/specs/core/I18nMixin.spec.js > I18nMixin > without language in local storage > should switch to Spanish (es) |
| 549 | 29 | tests/unit/specs/core/Core.spec.js > Core > Call useAll on Core > should mount the app on a specific element |
| 550 | 29 | tests/unit/specs/composables/useNProgress.spec.js > useNProgress > should toggle the progress explicitely to show it |
| 551 | 29 | tests/unit/specs/components/Login/LoginCardForm.spec.js > LoginCardForm.vue > should show an error message when error prop is true |
| 552 | 29 | tests/unit/specs/components/Hook/Hook.spec.js > Hook.vue > should be a Vue instance |
| 553 | 29 | tests/unit/specs/components/Entity/EntityButton.spec.js > EntityButton.vue > should be a Vue instance |
| 554 | 29 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryHeaderToggler.spec.js > DocumentThreadEntryHeaderToggler.vue > should render different icons based on expanded state |
| 555 | 29 | tests/unit/specs/components/Document/DocumentDownloadPopover/DocumentDownloadPopover.spec.js > DocumentDownloadPopover.vue > should trigger download when the translation button is clicked |
| 556 | 29 | tests/unit/specs/components/Document/DocumentDownloadPopover/DocumentDownloadPopover.spec.js > DocumentDownloadPopover.vue > should not show the translation download button when document has no translations |
| 557 | 29 | tests/unit/specs/components/Display/DisplaySnapshotName.spec.js > DisplaySnapshotName > should render the component |
| 558 | 29 | tests/unit/specs/components/Dismissable/DismissableAlert.spec.js > DismissableAlert > renders with default link label |
| 559 | 29 | tests/unit/specs/components/Dismissable/DismissableAlert.spec.js > DismissableAlert > does not show if dismissed is true |
| 560 | 28 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Retrieve query term > should grab terms between brackets |
| 561 | 28 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Delete query terms > should delete the term from the query |
| 562 | 28 | tests/unit/specs/core/I18nMixin.spec.js > I18nMixin > with german language in local storage > should switch to Japanese (ja) |
| 563 | 28 | tests/unit/specs/composables/useNProgress.spec.js > useNProgress > should not be in loading state after `remove` is called |
| 564 | 28 | tests/unit/specs/composables/useNProgress.spec.js > useNProgress > should create the progress bar after `start` is callend then remove it with `remove` |
| 565 | 28 | tests/unit/specs/components/Widget/WidgetDocumentsByCreationDate.spec.js > WidgetDocumentsByCreationDate.vue > with 3 valid creation date > selectedInterval default value should be year |
| 566 | 28 | tests/unit/specs/components/PathBanner/PathBannersListEntry.spec.js > PathBannersListEntry.vue > renders the banner path |
| 567 | 28 | tests/unit/specs/components/PageHeader/PageHeaderToolbar.spec.js > PageHeaderToolbar.vue > should display a form-control-search when `searchable` is true |
| 568 | 28 | tests/unit/specs/components/Login/LoginCardForm.spec.js > LoginCardForm.vue > should not show an error message by default |
| 569 | 28 | tests/unit/specs/components/Login/LoginCardForm.spec.js > LoginCardForm.vue > should emit submit event with credentials on form submit |
| 570 | 28 | tests/unit/specs/components/Dismissable/DismissableAlert.spec.js > DismissableAlert > renders the icon if noIcon is false |
| 571 | 28 | tests/unit/specs/components/Dismissable/DismissableAlert.spec.js > DismissableAlert > applies the correct class to the link based on the variant |
| 572 | 27 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Retrieve query term > should retrieve no applied filters (2/2) |
| 573 | 27 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Build route query > updateFromRouteQuery should restore search state from url > should set the from of the store according to the url |
| 574 | 27 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshots.spec.js > SettingsSnapshots > when repository is configured > should display the create button |
| 575 | 27 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsCreate.spec.js > SettingsSnapshotsCreate > should emit create event when clicked |
| 576 | 27 | tests/unit/specs/components/PathBanner/PathBannerForm.spec.js > PathBannerForm.vue > variant and sensitive content fields > renders the blurSensitiveMedia radio group |
| 577 | 27 | tests/unit/specs/components/PathBanner/PathBannerForm.spec.js > PathBannerForm.vue > reset() > resets to empty defaults for a new banner |
| 578 | 27 | tests/unit/specs/components/Login/LoginCardForm.spec.js > LoginCardForm.vue > should disable inputs and submit button when disabled prop is true |
| 579 | 27 | tests/unit/specs/components/Dismissable/DismissableToastBody.spec.js > DismissableToastBody > applies close-on-click class when toastProps.closeOnClick is true |
| 580 | 27 | tests/unit/specs/components/Dismissable/DismissableAlert.spec.js > DismissableAlert > does not render the button if noButton is true |
| 581 | 26 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > selectedBanner returns the banner matching the path hash in the route |
| 582 | 26 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > openEditModal pushes to banners route with the path hash |
| 583 | 26 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > delete > does not call deletePathBanner API when user cancels |
| 584 | 26 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBannersModal.spec.js > ProjectViewEditPathBannersModal.vue > title says "Add banner" for the new route |
| 585 | 26 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBannersModal.spec.js > ProjectViewEditPathBannersModal.vue > save > does not emit banner:save when API call fails |
| 586 | 26 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBannersModal.spec.js > ProjectViewEditPathBannersModal.vue > modal is open when route has a bannerId |
| 587 | 26 | tests/unit/specs/store/modules/search.spec.js > SearchStore > With filter values > this filter should have value |
| 588 | 26 | tests/unit/specs/store/modules/search.spec.js > SearchStore > runBatchDownload > should pass the field-specific fields array to the batch download query |
| 589 | 26 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Named entities filter > should define a `named-entity` filter correctly (name, key, type and PERSON category) |
| 590 | 26 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Delete query terms > should delete a negative term from a recursive query |
| 591 | 26 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Delete query terms > should delete 1 simple query term |
| 592 | 26 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Build route query > updateFromRouteQuery should not be cumulated with existing filter > should set the query to empty after the store is updated with a route query |
| 593 | 26 | tests/unit/specs/components/Settings/SettingsGeneral/SettingsGeneral.spec.js > SettingsGeneral > should treat settings containing obfuscated value as obfuscated |
| 594 | 26 | tests/unit/specs/components/PathBanner/PathBanner.spec.js > PathBanner.vue > renders a DismissableAlert |
| 595 | 26 | tests/unit/specs/components/Document/DocumentPathBanners.spec.js > DocumentPathBanners.vue > should NOT display path banner on document |
| 596 | 26 | tests/unit/specs/components/Document/DocumentPathBanners.spec.js > DocumentPathBanners.vue > should display 2 path banners on document |
| 597 | 26 | tests/unit/specs/components/Document/DocumentGlobalSearchTermsEntry.spec.js > DocumentGlobalSearchTermsEntry > shows in tags text when there is tags |
| 598 | 25 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > closeModal pushes to banners route without bannerId |
| 599 | 25 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Suffixed store > should create a store with a closure function |
| 600 | 25 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Delete query terms > should delete a term from a recursive query |
| 601 | 25 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Delete query terms > should delete a negative term from a complex query |
| 602 | 25 | tests/unit/specs/core/ComponentsMixin.spec.js > ComponentsMixin > should find component by name with exact match |
| 603 | 25 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > ES_SNAPSHOT_DEFAULT_REPOSITORY > should export default repository name |
| 604 | 25 | tests/unit/specs/components/Widget/WidgetListGroup.spec.js > WidgetListGroup.vue > should contain a title with a `card-body` class |
| 605 | 25 | tests/unit/specs/components/PathBanner/PathBannersListEntry.spec.js > PathBannersListEntry.vue > blurSensitiveMedia badge > renders the sensitive badge when blurSensitiveMedia is true |
| 606 | 25 | tests/unit/specs/components/PathBanner/PathBannerForm.spec.js > PathBannerForm.vue > variant and sensitive content fields > binds the current variant to VariantDropdown |
| 607 | 25 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryHeaderTo.spec.js > DocumentThreadEntryHeaderTo.vue > should render the "to" label |
| 608 | 25 | tests/unit/specs/components/Dismissable/DismissableAlert.spec.js > DismissableAlert > shows if dismissed is false |
| 609 | 24 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > selectedBanner is null and closeModal is called when bannerId hash matches no banner |
| 610 | 24 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Suffixed store > should create store with a defined id |
| 611 | 24 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Sort filter > this filter should sort language by _count |
| 612 | 24 | tests/unit/specs/store/modules/search.spec.js > SearchStore > runBatchDownload > should pass the selected field to the elasticsearch query |
| 613 | 24 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Delete query terms > should delete term from a query with parenthesis |
| 614 | 24 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Delete query terms > should delete duplicated term from a query |
| 615 | 24 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Delete query terms > should delete "AND" boolean operator on last applied filter deletion, if any |
| 616 | 24 | tests/unit/specs/composables/useSearchFilter.spec.js > useSearchFilter > refreshSearchFromRoute > restores searchOperator from route query using refreshSearchFromRouteStart |
| 617 | 24 | tests/unit/specs/components/Document/DocumentViewer/DocumentViewerPdf/DocumentViewerPdfNavDropdown/DocumentViewerPdfNavDropdownScale.spec.js > DocumentViewerPdfDropdownScale.vue > zooms out and zooms in numeric scales |
| 618 | 24 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryExcerpt.spec.js > DocumentThreadEntryExcerpt.vue > should render the excerpt text |
| 619 | 23 | tests/unit/specs/views/Login/Login.spec.js > Login.vue > should not show the card layout by default |
| 620 | 23 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Delete query terms > should delete 1 simple prefixed query term |
| 621 | 23 | tests/unit/specs/core/I18nMixin.spec.js > I18nMixin > without language in local storage > should use "en" as default language |
| 622 | 23 | tests/unit/specs/core/ComponentsMixin.spec.js > ComponentsMixin > should find an instantiable component |
| 623 | 23 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsSetup.spec.js > SettingsSnapshotsSetup > paths available state > should emit submit event with different selected path |
| 624 | 23 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsSetup.spec.js > SettingsSnapshotsSetup > paths available state > should display the path select |
| 625 | 23 | tests/unit/specs/components/PathBanner/PathBannersList.spec.js > PathBannersList.vue > does not show EmptyState when banners are present |
| 626 | 23 | tests/unit/specs/components/Mode/ModeLocalOnly.spec.js > ModeLocalOnly.vue > when the initial mode is `LOCAL` > should display "foo" |
| 627 | 22 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBannersModal.spec.js > ProjectViewEditPathBannersModal.vue > title says "Edit banner" for the edit route |
| 628 | 22 | tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js > DocumentViewTabsViewer.vue > should call the DocumentViewerTiff component for TIFF document |
| 629 | 22 | tests/unit/specs/store/modules/starred.spec.js > StarredStore > should not change the starredDocuments on updateFromRouteQuery |
| 630 | 22 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Suffixed store > should create store with a default id |
| 631 | 22 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Delete query terms > should delete "OR" boolean operator on last applied filter deletion, if any |
| 632 | 22 | tests/unit/specs/composables/useTaskSettings.spec.js > useTaskSettings > should initialize "app/entities" task settings per page is 10 |
| 633 | 22 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsSetup.spec.js > SettingsSnapshotsSetup > paths available state > should auto-select the first path |
| 634 | 22 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsActions.spec.js > SettingsSnapshotsActions > should enable buttons when snapshot is not in progress |
| 635 | 22 | tests/unit/specs/components/Project/ProjectThumbnail.spec.js > ProjectThumbnail.vue > should not be checked when `checked` prop is set |
| 636 | 22 | tests/unit/specs/components/PathBanner/PathBannerForm.spec.js > PathBannerForm.vue > "Use default text" button > is not rendered when blurSensitiveMedia is false |
| 637 | 22 | tests/unit/specs/components/Document/DocumentViewer/DocumentViewerJson.spec.js > DocumentViewerJson.vue > should render the JSON in a JsonFormatter component |
| 638 | 22 | tests/unit/specs/components/Display/DisplayEmpty.spec.js > DisplayEmpty > when value is provided > should display the value |
| 639 | 22 | tests/unit/specs/components/Dismissable/DismissableAlert.spec.js > DismissableAlert > renders with provided link label |
| 640 | 22 | tests/unit/specs/components/ColumnChartPicker.spec.js > ColumnChartPicker.vue > renders correctly |
| 641 | 22 | tests/unit/composables/usePolicies.spec.js > usePolicies > formatRole formats single role using translation |
| 642 | 21 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > reloads banners when the modal emits banner:save |
| 643 | 21 | tests/unit/specs/store/modules/starred.spec.js > StarredStore > should not reset the starredDocuments |
| 644 | 21 | tests/unit/specs/components/Widget/WidgetText.spec.js > WidgetText.vue > should only contain "hello world" |
| 645 | 21 | tests/unit/specs/components/Widget/WidgetListGroup.spec.js > WidgetListGroup.vue > should contain a 3 items |
| 646 | 21 | tests/unit/specs/components/Project/ProjectCard/ProjectCardFooter.spec.js > ProjectCardFooter.vue > DisplayRole in server mode > shows PROJECT_EDITOR role when policy has PROJECT_EDITOR |
| 647 | 21 | tests/unit/specs/components/PathBanner/PathBannersListEntry.spec.js > PathBannersListEntry.vue > blurSensitiveMedia badge > does not render the sensitive badge when blurSensitiveMedia is false |
| 648 | 21 | tests/unit/specs/components/PathBanner/PathBannerForm.spec.js > PathBannerForm.vue > "Use default text" button > sets note to the default sensitive content text when clicked |
| 649 | 21 | tests/unit/specs/components/PathBanner/PathBannerForm.spec.js > PathBannerForm.vue > renders PathBannerPreview |
| 650 | 21 | tests/unit/specs/components/Display/DisplayUser.spec.js > DisplayUser.vue > should display "foo" in uppercase with a pipeline |
| 651 | 21 | tests/unit/specs/components/Dismissable/DismissableAlert.spec.js > DismissableAlert > does not render the icon if noIcon is true |
| 652 | 20 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Suffixed store > should create store with a different id than the default search store |
| 653 | 20 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Search response > should build a EsDocList object from raw value |
| 654 | 20 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Reset state > should reset to initial state |
| 655 | 20 | tests/unit/specs/store/modules/search.spec.js > SearchStore > estimateDownloadSize > passes "*" when the query is undefined |
| 656 | 20 | tests/unit/specs/store/modules/search.spec.js > SearchStore > estimateDownloadSize > forwards the API response |
| 657 | 20 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Build route query > updateFromRouteQuery should restore search state from url > should set the project of the store according to the url |
| 658 | 20 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Build route query > updateFromRouteQuery should not be cumulated with existing filter > should set the from to 0 after the store is updated with a route query |
| 659 | 20 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Build route query > updateFromRouteQuery should not be cumulated with existing filter > should reset the contentType filter after the store is updated with a route query |
| 660 | 20 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Build route query > should return the default query parameters |
| 661 | 20 | tests/unit/specs/store/modules/recommended.spec.js > RecommendedStore > should set documents to userIds |
| 662 | 20 | tests/unit/specs/store/modules/document.spec.js > DocumentStore > should define a store module |
| 663 | 20 | tests/unit/specs/router/guards.spec.js > guards > checkUserAuthentication > when the user is not authenticated > should redirect to /login if cookie is null |
| 664 | 20 | tests/unit/specs/composables/useTaskSettings.spec.js > useTaskSettings > should initialize "app/batch-download" task settings propertiesModelValueOptions contains correct properties |
| 665 | 20 | tests/unit/specs/components/Task/Task.spec.js > Task.vue > should fetch tasks on mount |
| 666 | 20 | tests/unit/specs/components/Project/ProjectJumbotron/ProjectJumbotron.spec.js > ProjectJumbotron.vue > DisplayRole in server mode > shows default role when no policy exists for the project |
| 667 | 20 | tests/unit/specs/components/PathBanner/PathBannerForm.spec.js > PathBannerForm.vue > variant and sensitive content fields > renders the VariantDropdown |
| 668 | 20 | tests/unit/specs/components/PathBanner/PathBannerForm.spec.js > PathBannerForm.vue > "Use default text" button > is rendered when blurSensitiveMedia is true |
| 669 | 20 | tests/unit/specs/components/Login/LoginCardForm.spec.js > LoginCardForm.vue > should have password field of type password |
| 670 | 20 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryHeader.spec.js > DocumentThreadEntryHeader.vue > should show toggler for a non-active email |
| 671 | 20 | tests/unit/specs/components/Document/DocumentGlobalSearchTermsEntry.spec.js > DocumentGlobalSearchTermsEntry > shows in metadata text when there is metadata |
| 672 | 20 | tests/unit/specs/components/Display/DisplayVersion.spec.js > DisplayVersion > should render the component |
| 673 | 20 | tests/unit/specs/components/Dismissable/DismissableContentWarningToggler.spec.js > DismissableContentWarningToggler.vue > renders a custom title slot |
| 674 | 19 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > delete > keeps the banner in the list when user cancels |
| 675 | 19 | tests/unit/specs/store/modules/starred.spec.js > StarredStore > should return the list of the starredDocuments |
| 676 | 19 | tests/unit/specs/store/modules/search.spec.js > SearchStore > With filter values > this filter should have no values |
| 677 | 19 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Retrieve query term > should remove escaped slash |
| 678 | 19 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Initial state > should define a store module |
| 679 | 19 | tests/unit/specs/store/modules/search.spec.js > SearchStore > estimateDownloadSize > passes the selected field as the fields array |
| 680 | 19 | tests/unit/specs/store/modules/search.spec.js > SearchStore > estimateDownloadSize > passes the search operator to the elasticsearch client |
| 681 | 19 | tests/unit/specs/store/modules/search.spec.js > SearchStore > estimateDownloadSize > passes the literal query when set |
| 682 | 19 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Build route query > updateFromRouteQuery should not be cumulated with existing filter > should not empty "index" and "indices" after the store is updated |
| 683 | 19 | tests/unit/specs/store/modules/recommended.spec.js > RecommendedStore > should reset the list of documents recommended if no users |
| 684 | 19 | tests/unit/specs/core/ProjectsMixin.spec.js > ProjectsMixin > should call a function when a project is selected |
| 685 | 19 | tests/unit/specs/core/ComponentsMixin.spec.js > ComponentsMixin > should throw an exception with unknown component |
| 686 | 19 | tests/unit/specs/composables/useNProgress.spec.js > useNProgress > should be in loading state only after `start` is called |
| 687 | 19 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > fetchSnapshots > should handle empty snapshots |
| 688 | 19 | tests/unit/specs/components/Widget/WidgetText.spec.js > WidgetText.vue > should contain a title "hello world" |
| 689 | 19 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshots.spec.js > SettingsSnapshots > when repository is configured > should emit create event when create button is clicked |
| 690 | 19 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsCreate.spec.js > SettingsSnapshotsCreate > should be disabled when loading |
| 691 | 19 | tests/unit/specs/components/PageHeader/PageHeaderNav.spec.js > PageHeaderNav.vue > should NOT display a button-toggle-settings when `noBreadcrumb` is true |
| 692 | 19 | tests/unit/specs/components/PageHeader/PageHeaderNav.spec.js > PageHeaderNav.vue > should display a button-toggle-settings by default |
| 693 | 19 | tests/unit/specs/components/Document/DocumentViewer/DocumentViewerPdf/DocumentViewerPdfNavDropdown/DocumentViewerPdfNavDropdownScale.spec.js > DocumentViewerPdfDropdownScale.vue > displays numeric scale text for default numeric value |
| 694 | 19 | tests/unit/specs/components/Document/DocumentViewer/DocumentViewerPdf/DocumentViewerPdfNavDropdown/DocumentViewerPdfNavDropdownRotationCounterClockwise.spec.js > RotateCounterClockwiseButton.vue > advances from a non‐zero starting rotation |
| 695 | 19 | tests/unit/specs/components/Document/DocumentViewer/DocumentViewerPdf/DocumentViewerPdfNavDropdown/DocumentViewerPdfNavDropdownRotationClockwise.spec.js > RotateClockwiseButton.vue > advances from a non‐zero starting rotation |
| 696 | 19 | tests/unit/specs/components/Display/DisplayUser.spec.js > DisplayUser.vue > should not display a link if the `hideLink` property is set |
| 697 | 18 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > resolves the edit modal correctly when page is refreshed directly on an edit URL |
| 698 | 18 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBannersModal.spec.js > ProjectViewEditPathBannersModal.vue > save > does not navigate back when save fails |
| 699 | 18 | tests/unit/specs/store/modules/starred.spec.js > StarredStore > should remove a documentId from the list of the starredDocuments |
| 700 | 18 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Search response > should build a correct EsDocList object from raw value |
| 701 | 18 | tests/unit/specs/store/modules/search.spec.js > SearchStore > runBatchDownload > should pass empty fields when searching in all fields |
| 702 | 18 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Retrieve query term > should retrieve 1 applied filter |
| 703 | 18 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Retrieve query term > should apply the negation only to the second group |
| 704 | 18 | tests/unit/specs/store/modules/search.spec.js > SearchStore > estimateDownloadSize > passes "*" when the query is null |
| 705 | 18 | tests/unit/specs/store/modules/search.spec.js > SearchStore > estimateDownloadSize > passes "*" when the query is empty |
| 706 | 18 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Content type filter > should find a "contentType" filter using function |
| 707 | 18 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Build route query > updateFromRouteQuery should restore search state from url > should set the query of the store according to the url |
| 708 | 18 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Build route query > updateFromRouteQuery should restore search state from url > should not change the field on updateFromRouteQuery |
| 709 | 18 | tests/unit/specs/router/guards.spec.js > guards > checkUserAuthentication > when the user is not authenticated > should redirect to /login if no cookie |
| 710 | 18 | tests/unit/specs/core/Core.spec.js > Core > Call useAll on Core > should call a global event "datashare:ready" after the core is configured |
| 711 | 18 | tests/unit/specs/composables/useSearchFilter.spec.js > useSearchFilter > watchOperator > does not call callback when an unrelated setting changes |
| 712 | 18 | tests/unit/specs/composables/useSearchFilter.spec.js > useSearchFilter > refreshSearchFromRoute > ignores invalid searchOperator values from route query in refreshSearchFromRouteStart |
| 713 | 18 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > fetchSnapshots > should handle API errors gracefully |
| 714 | 18 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsSetup.spec.js > SettingsSnapshotsSetup > paths available state > should not disable submit button when path is selected |
| 715 | 18 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsSetup.spec.js > SettingsSnapshotsSetup > paths available state > should disable submit button when loading |
| 716 | 18 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsSetup.spec.js > SettingsSnapshotsSetup > paths available state > should disable select when loading |
| 717 | 18 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsSetup.spec.js > SettingsSnapshotsSetup > no paths available state > should display warning when no paths are available |
| 718 | 18 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsCreate.spec.js > SettingsSnapshotsCreate > should not be disabled when not loading |
| 719 | 18 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsActions.spec.js > SettingsSnapshotsActions > should render restore button |
| 720 | 18 | tests/unit/specs/components/Display/DisplayUser.spec.js > DisplayUser.vue > should display a link to the user profile based on the username |
| 721 | 18 | tests/unit/specs/components/Display/DisplayUserAvatar.spec.js > DisplayUserAvatar.vue > should display an avatar with an URL based on the username |
| 722 | 17 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > store invalidation > syncs the path banners store after loadBanners |
| 723 | 17 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > selectedBanner is null when no bannerId in route |
| 724 | 17 | tests/unit/specs/store/modules/starred.spec.js > StarredStore > should set the starredDocuments property of the filter |
| 725 | 17 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Sort filter > this filter should not sort language anymore |
| 726 | 17 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Sort filter > this filter should have no sortFilters |
| 727 | 17 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Retrieve query term > should filter on boolean operators "AND" and "OR" |
| 728 | 17 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Path filter > should define a `path` filter correctly (name, key and type) |
| 729 | 17 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Initial state > should instantiate the default 14 filters, with order |
| 730 | 17 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Creation date filter > should set this value to the filter |
| 731 | 17 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Content type filter > should define a "contentType" filter correctly (name, key and type) |
| 732 | 17 | tests/unit/specs/store/modules/recommended.spec.js > RecommendedStore > should return users who recommended documents from this project |
| 733 | 17 | tests/unit/specs/router/guards.spec.js > guards > checkUserRole > should skip role check in EMBEDDED mode |
| 734 | 17 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > hasInProgress > should return true when there are in-progress snapshots |
| 735 | 17 | tests/unit/specs/components/Widget/WidgetText.spec.js > WidgetText.vue > should have a `widget--text` class |
| 736 | 17 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsActions.spec.js > SettingsSnapshotsActions > should render delete button |
| 737 | 17 | tests/unit/specs/components/Project/ProjectJumbotron/ProjectJumbotron.spec.js > ProjectJumbotron.vue > DisplayRole in server mode > shows PROJECT_EDITOR role when policy has PROJECT_EDITOR |
| 738 | 17 | tests/unit/specs/components/PathBanner/PathBannerForm.spec.js > PathBannerForm.vue > isValid is true when path and note are set |
| 739 | 17 | tests/unit/specs/components/Document/DocumentGlobalSearchTermsEntry.spec.js > DocumentGlobalSearchTermsEntry > shows the label |
| 740 | 17 | tests/unit/specs/api/elasticsearch.spec.js > elasticsearch > should emit an error if the backend response is an error |
| 741 | 16 | tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js > DocumentViewTabsViewer.vue > should call the DocumentViewerPaginated component for Word document |
| 742 | 16 | tests/unit/specs/store/modules/starred.spec.js > StarredStore > should push a documentId from the list of the starredDocuments only if it does not exist |
| 743 | 16 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Retrieve query term > should return a negation parameter if query contains "AND NOT" or "OR NOT" |
| 744 | 16 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Retrieve query term > should retrieve 2 applied filters |
| 745 | 16 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Retrieve query term > should merge 2 identical terms |
| 746 | 16 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Retrieve query term > should detect regex and return it as true |
| 747 | 16 | tests/unit/specs/store/modules/search.spec.js > SearchStore > estimateDownloadSize > passes an empty fields array when searching all fields |
| 748 | 16 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Content type filter > should find a "contentType" filter using object |
| 749 | 16 | tests/unit/specs/store/modules/document.spec.js > DocumentStore > should reset the store state |
| 750 | 16 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > sortedSnapshots > should return snapshots sorted by date descending |
| 751 | 16 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > hasInProgress > should return false when no in-progress snapshots |
| 752 | 16 | tests/unit/specs/components/Widget/WidgetText.spec.js > WidgetText.vue > should contain a title with a `card-body` class |
| 753 | 16 | tests/unit/specs/components/Widget/WidgetListGroup.spec.js > WidgetListGroup.vue > should contain a title without `card-body` class |
| 754 | 16 | tests/unit/specs/components/Widget/WidgetListGroup.spec.js > WidgetListGroup.vue > should contain a link |
| 755 | 16 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsActions.spec.js > SettingsSnapshotsActions > should disable buttons when snapshot is in progress |
| 756 | 16 | tests/unit/specs/components/Project/ProjectCard/ProjectCardFooter.spec.js > ProjectCardFooter.vue > DisplayRole in server mode > shows default role when no policy exists for the project |
| 757 | 16 | tests/unit/specs/components/PathBanner/PathBannerForm.spec.js > PathBannerForm.vue > reset() > restores all fields to the original banner prop values |
| 758 | 16 | tests/unit/specs/components/PathBanner/PathBannerForm.spec.js > PathBannerForm.vue > isValid is false when note is empty |
| 759 | 16 | tests/unit/specs/components/Mode/ModeServerOnly.spec.js > ModeServerOnly.vue > when the initial mode is `SERVER` > should hide "foo" reactivly in `LOCAL` |
| 760 | 16 | tests/unit/specs/components/JsonFormatter.spec.js > JsonFormatter.vue > should render an open row |
| 761 | 16 | tests/unit/specs/components/Display/DisplaySnapshotRepositoryType.spec.js > DisplaySnapshotRepositoryType > should display the icon |
| 762 | 16 | tests/unit/specs/components/Display/DisplaySnapshotRepositoryType.spec.js > DisplaySnapshotRepositoryType > should default to fs type when no value provided |
| 763 | 16 | tests/unit/specs/components/Display/DisplayPath.spec.js > DisplayPath > should display the mounted path when value starts with dataDir |
| 764 | 16 | tests/unit/specs/api/elasticsearch.spec.js > elasticsearch > should set default_operator to "AND" in ES query when operator is "AND" |
| 765 | 15 | tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsEntities.spec.js > DocumentViewTabsEntities.vue > should contains a specific text when no NER task has been run on that document |
| 766 | 15 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Starred filter > should define a `starred` filter correctly (name, key, type and starredDocuments) |
| 767 | 15 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Sort filter > this filter should have a default sort for language |
| 768 | 15 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Retrieve query term > should return a negation parameter if query starts by "NOT" |
| 769 | 15 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Retrieve query term > should return a negation parameter according to the prefix |
| 770 | 15 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Retrieve query term > should retrieve no applied filters (1/2) |
| 771 | 15 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Retrieve query term > should retrieve 3 applied filters |
| 772 | 15 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Retrieve query term > should filter on fuzziness number |
| 773 | 15 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Retrieve query term > should display field name |
| 774 | 15 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Indexing date filter > should define an `indexing date` filter correctly (name, key and type) |
| 775 | 15 | tests/unit/specs/store/modules/search.spec.js > SearchStore > estimateDownloadSize > passes indices and instantiated filters to the elasticsearch client |
| 776 | 15 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Common filter > should define a "language" filter correctly (name, key and type) |
| 777 | 15 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Common filter > should add a filter |
| 778 | 15 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Build route query > updateFromRouteQuery should not be cumulated with existing filter > should not reset the "field" after the store is updated |
| 779 | 15 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Build route query > should reflect AND searchOperator in the route query when set |
| 780 | 15 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Build route query > should include searchOperator in the route query |
| 781 | 15 | tests/unit/specs/store/modules/recommended.spec.js > RecommendedStore > should return the total of documents recommended for this project |
| 782 | 15 | tests/unit/specs/store/modules/recommended.spec.js > RecommendedStore > should init byUsers to an empty array |
| 783 | 15 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should create a store factory that can be used with `mapStores` in a component |
| 784 | 15 | tests/unit/specs/composables/useDocumentDownload.spec.js > useDocumentDownload composable > downloadTranslatedContent > should create a blob download with translated content |
| 785 | 15 | tests/unit/specs/components/Widget/WidgetText.spec.js > WidgetText.vue > should contain a title without `card-body` class |
| 786 | 15 | tests/unit/specs/components/PathBanner/PathBannerForm.spec.js > PathBannerForm.vue > isValid is false when path is null |
| 787 | 15 | tests/unit/specs/components/PageHeader/PageHeaderToolbar.spec.js > PageHeaderToolbar.vue > should display a tiny-pagination when `paginable` is true |
| 788 | 15 | tests/unit/specs/components/Document/DocumentViewer/DocumentViewerPdf/DocumentViewerPdfNavDropdown/DocumentViewerPdfNavDropdownRotationClockwise.spec.js > RotateClockwiseButton.vue > wraps around to first rotation after the last one |
| 789 | 15 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryHeader.spec.js > DocumentThreadEntryHeader.vue > should not show toggler for the active email |
| 790 | 15 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryHeaderCreationDate.spec.js > DocumentThreadEntryHeaderCreationDate.vue > should render DisplayDatetimeLong with the creation date |
| 791 | 15 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryExcerpt.spec.js > DocumentThreadEntryExcerpt.vue > should have the excerpt class |
| 792 | 15 | tests/unit/specs/components/Display/DisplayUser.spec.js > DisplayUser.vue > should not display an avatar |
| 793 | 15 | tests/unit/specs/components/Display/DisplayEmpty.spec.js > DisplayEmpty > when value is provided > should use default slot content when provided |
| 794 | 15 | tests/unit/specs/components/Dismissable/DismissableToastBody.spec.js > DismissableToastBody > shows link section if href is provided |
| 795 | 15 | tests/unit/specs/components/Dismissable/DismissableAlertEditable.spec.js > DismissableAlertEditable.vue > passes variant to DismissableAlert |
| 796 | 15 | tests/unit/specs/components/BatchDownload/BatchDownloadConfirmModal.spec.js > BatchDownloadConfirmModal.vue > always renders the trailing question paragraph |
| 797 | 15 | tests/unit/specs/api/elasticsearch.spec.js > elasticsearch > should default default_operator to "OR" when no operator is provided |
| 798 | 14 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > pathHash > produces different hashes for different paths |
| 799 | 14 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > pathHash > is stable, same path always produces the same hash |
| 800 | 14 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Common filter > should reset the store state |
| 801 | 14 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Build route query > updateFromRouteQuery should restore search state from url > should set the filter of the store according to the url |
| 802 | 14 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Build route query > should return an advanced and filtered query parameters |
| 803 | 14 | tests/unit/specs/store/modules/recommended.spec.js > RecommendedStore > should init total to zero |
| 804 | 14 | tests/unit/specs/router/guards.spec.js > guards > checkUserProjects > should redirect to error when user has no projects |
| 805 | 14 | tests/unit/specs/router/guards.spec.js > guards > checkUserAuthentication > when the user is not authenticated > should redirect to /login if cookie has no login property |
| 806 | 14 | tests/unit/specs/core/FiltersMixin.spec.js > FiltersMixin > should register the filter after the global event "datashare:ready" |
| 807 | 14 | tests/unit/specs/core/Core.spec.js > Core > Call useAll on Core > should return first user project when user doesn't have the default project |
| 808 | 14 | tests/unit/specs/core/Core.spec.js > Core > Call useAll on Core > should resolve the `ready` promise after the core was configured |
| 809 | 14 | tests/unit/specs/core/Core.spec.js > Core > Call useAll on Core > should expose the VueI18n |
| 810 | 14 | tests/unit/specs/composables/useUrlParam.spec.js > useUrlParamWithStore > should sync a single query parameter with the store |
| 811 | 14 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > fetchRepositories > should handle fetch repositories error |
| 812 | 14 | tests/unit/specs/composables/useElementObserver.spec.js > useElementObserver > resolves immediately if element already exists (created) |
| 813 | 14 | tests/unit/specs/composables/useDocumentDownload.spec.js > useDocumentDownload composable > fetchStatuses > should fetch download status and translations when fetchStatuses is called |
| 814 | 14 | tests/unit/specs/components/Widget/WidgetListGroup.spec.js > WidgetListGroup.vue > should reverse the list using a pipeline |
| 815 | 14 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsList.spec.js > SettingsSnapshotsList > should display loading spinner when loading and no snapshots |
| 816 | 14 | tests/unit/specs/components/Hook/Hook.spec.js > Hook.vue > should be in debug mode |
| 817 | 14 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntry.spec.js > DocumentThreadEntry.vue > should add active class when active prop is true |
| 818 | 14 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryHeader.spec.js > DocumentThreadEntryHeader.vue > should show DocumentThreadEntryHeaderTo when expanded with messageTo |
| 819 | 14 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryHeader.spec.js > DocumentThreadEntryHeader.vue > should not show DocumentThreadEntryHeaderTo when collapsed |
| 820 | 14 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryHeaderCreationDate.spec.js > DocumentThreadEntryHeaderCreationDate.vue > should link to the document route with correct params |
| 821 | 14 | tests/unit/specs/components/Display/DisplayUser.spec.js > DisplayUser.vue > should display an avatar |
| 822 | 14 | tests/unit/specs/components/Display/DisplaySnapshotRepositoryType.spec.js > DisplaySnapshotRepositoryType > should display the label |
| 823 | 14 | tests/unit/specs/components/Display/DisplayEmpty.spec.js > DisplayEmpty > when value is provided > should not have the empty modifier class |
| 824 | 14 | tests/unit/specs/components/Dismissable/DismissableToastBody.spec.js > DismissableToastBody > renders with error variant when toastProps type is error |
| 825 | 14 | tests/unit/specs/components/Dismissable/DismissableContentWarningToggler.spec.js > DismissableContentWarningToggler.vue > emits update:modelValue with toggled value when the button is clicked |
| 826 | 14 | tests/unit/specs/components/BatchSearch/BatchSearchActions.spec.js > BatchSearchActions.vue > with a queued task > should display a disabled button to relaunch the batchSearch is queued |
| 827 | 14 | tests/unit/specs/components/BatchDownload/BatchDownloadActions.spec.js > BatchDownloadActions.vue > search link > should not put the uri in the hash property of the route |
| 828 | 14 | tests/unit/specs/api/resources/Auth.spec.js > auth backend client > getUsername > should return user name if user is authenticated with basic auth |
| 829 | 14 | tests/unit/specs/api/elasticsearch.spec.js > elasticsearch > should build a simple ES query |
| 830 | 14 | tests/unit/specs/api/elasticsearch.spec.js > elasticsearch > should build an ES query with filters |
| 831 | 13 | tests/unit/specs/store/modules/starred.spec.js > StarredStore > should toggle a starred documentId, remove it if it is starred |
| 832 | 13 | tests/unit/specs/store/modules/starred.spec.js > StarredStore > should toggle a starred documentId, push it if it is not starred |
| 833 | 13 | tests/unit/specs/store/modules/starred.spec.js > StarredStore > should push a documentId from the list of the starredDocuments |
| 834 | 13 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Retrieve query term > should replace escaped arobase in regex |
| 835 | 13 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Retrieve query term > should not split an exact search sentence |
| 836 | 13 | tests/unit/specs/store/modules/documentDownload.spec.js > DocumentDownloadStore > initial state > should be allowed by default |
| 837 | 13 | tests/unit/specs/router/guards.spec.js > guards > checkUserProjects > should allow navigation when user has projects |
| 838 | 13 | tests/unit/specs/router/guards.spec.js > guards > checkUserProjects > should allow navigation to /login even with no projects |
| 839 | 13 | tests/unit/specs/router/guards.spec.js > guards > checkUserAuthentication > when the user is not authenticated > should not redirect to /login when already on /login |
| 840 | 13 | tests/unit/specs/core/Core.spec.js > Core > Call useAll on Core > should getDefaultProject when user has it |
| 841 | 13 | tests/unit/specs/composables/useSearchFilter.spec.js > useSearchFilter > watchOperator > calls callback when search operator changes from AND to OR |
| 842 | 13 | tests/unit/specs/composables/useNProgress.spec.js > useNProgress > should toggle the progress |
| 843 | 13 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > createRepository > should create repository with path |
| 844 | 13 | tests/unit/specs/components/Widget/WidgetListGroup.spec.js > WidgetListGroup.vue > should feed the list using a pipeline |
| 845 | 13 | tests/unit/specs/components/Widget/WidgetEmpty.spec.js > WidgetEmpty.vue > should have a `widget--empty` class |
| 846 | 13 | tests/unit/specs/components/Task/TaskActions.spec.js > Task Actions > emits stop-pending on clicking stop pending tasks |
| 847 | 13 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsSetup.spec.js > SettingsSnapshotsSetup > no paths available state > should display warning title |
| 848 | 13 | tests/unit/specs/components/Project/ProjectLink.spec.js > ProjectLink.vue > should not be a router link when `disabled` is set |
| 849 | 13 | tests/unit/specs/components/Project/ProjectLink.spec.js > ProjectLink.vue > should have a project thumbnail by default |
| 850 | 13 | tests/unit/specs/components/PathBanner/PathBannersListEntry.spec.js > PathBannersListEntry.vue > emits banner:edit with the index when edit button is clicked |
| 851 | 13 | tests/unit/specs/components/Document/DocumentViewer/DocumentViewerPdf/DocumentViewerPdfNavDropdown/DocumentViewerPdfNavDropdownRotationCounterClockwise.spec.js > RotateCounterClockwiseButton.vue > wraps around to first rotation after the last one |
| 852 | 13 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntry.spec.js > DocumentThreadEntry.vue > should pass document prop to DocumentTranslation when active |
| 853 | 13 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntry.spec.js > DocumentThreadEntry.vue > should hide DocumentTranslation when collapsed |
| 854 | 13 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntry.spec.js > DocumentThreadEntry.vue > should emit toggle when header emits toggle |
| 855 | 13 | tests/unit/specs/components/Display/DisplayUser.spec.js > DisplayUser.vue > should not display a link to the user profile |
| 856 | 13 | tests/unit/specs/components/Display/DisplaySnapshotRepositoryType.spec.js > DisplaySnapshotRepositoryType > should display "file system" for fs type |
| 857 | 13 | tests/unit/specs/components/Display/DisplaySnapshotRepositoryType.spec.js > DisplaySnapshotRepositoryType > should display "Amazon S3" for s3 type |
| 858 | 13 | tests/unit/specs/components/Dismissable/DismissableToastBody.spec.js > DismissableToastBody > renders the body content correctly |
| 859 | 13 | tests/unit/specs/components/Dismissable/DismissableContentWarningToggler.spec.js > DismissableContentWarningToggler.vue > renders the default description when no prop is provided |
| 860 | 13 | tests/unit/specs/components/Dismissable/DismissableAlertEditable.spec.js > DismissableAlertEditable.vue > renders VariantDropdown for variant selection |
| 861 | 13 | tests/unit/specs/components/Dismissable/DismissableAlertEditable.spec.js > DismissableAlertEditable.vue > defaults variant to "info" |
| 862 | 13 | tests/unit/specs/components/BatchSearch/BatchSearchActions.spec.js > BatchSearchActions.vue > with a successful task > should display a button to delete the batchSearch |
| 863 | 12 | tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsEntities.spec.js > DocumentViewTabsEntities.vue > should display an error message if no named entities has been found after names finding task |
| 864 | 12 | tests/unit/specs/views/Project/ProjectView/ProjectViewEditPathBanners/ProjectViewEditPathBanners.spec.js > ProjectViewEditPathBanners.vue > store invalidation > does not update the path banners store when delete fails |
| 865 | 12 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Common filter > should not find a "yolo-type" filter |
| 866 | 12 | tests/unit/specs/store/modules/searchBreadcrumb.spec.js > SearchBreadcrumbStore > pushes a new query and processes one index correctly |
| 867 | 12 | tests/unit/specs/store/modules/insights.spec.js > InsightsStore > should return a list of widget |
| 868 | 12 | tests/unit/specs/store/modules/document.spec.js > DocumentStore > Manage isRecommended status > should change isRecommended status to true |
| 869 | 12 | tests/unit/specs/core/Core.spec.js > Core > Call useAll on Core > should install the internal `VueCore` plugin |
| 870 | 12 | tests/unit/specs/core/ComponentsMixin.spec.js > ComponentsMixin > should return null with unknown component |
| 871 | 12 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > hasSinglePath > should return true when exactly one path is available |
| 872 | 12 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > fetchRepository > should fetch repository config |
| 873 | 12 | tests/unit/specs/composables/useBatchDownloadEstimation.spec.js > useBatchDownloadEstimation composable > formattedEstimatedSize and formattedMaxSize return humanized values |
| 874 | 12 | tests/unit/specs/components/Widget/WidgetListGroup.spec.js > WidgetListGroup.vue > should have a `widget--list-group` class |
| 875 | 12 | tests/unit/specs/components/Widget/WidgetEmpty.spec.js > WidgetEmpty.vue > should contain nothing but the void |
| 876 | 12 | tests/unit/specs/components/Project/ProjectThumbnail.spec.js > ProjectThumbnail.vue > should display a caption using the name |
| 877 | 12 | tests/unit/specs/components/Project/ProjectLink.spec.js > ProjectLink.vue > should display an "unknown" project |
| 878 | 12 | tests/unit/specs/components/PageHeader/PageHeaderToolbar.spec.js > PageHeaderToolbar.vue > should display a button-toggle-filters when `paginable` is true |
| 879 | 12 | tests/unit/specs/components/Mode/ModeServerOnly.spec.js > ModeServerOnly.vue > when the initial mode is `EMBEDDED` > should show "foo" reactivly in `SERVER` |
| 880 | 12 | tests/unit/specs/components/Hook/Hook.spec.js > Hook.vue > should have one component |
| 881 | 12 | tests/unit/specs/components/Entity/EntityButton.spec.js > EntityButton.vue > should use icon and color according to the category |
| 882 | 12 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntry.spec.js > DocumentThreadEntry.vue > should pass email as document to DocumentTranslation when not active |
| 883 | 12 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntry.spec.js > DocumentThreadEntry.vue > should pass active and expanded props to header |
| 884 | 12 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryHeader.spec.js > DocumentThreadEntryHeader.vue > should show DocumentThreadEntryExcerpt when collapsed |
| 885 | 12 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryHeader.spec.js > DocumentThreadEntryHeader.vue > should always show DocumentThreadEntryHeaderCreationDate |
| 886 | 12 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryHeaderFrom.spec.js > DocumentThreadEntryHeaderFrom.vue > should pass the messageFrom value to DisplayEmail |
| 887 | 12 | tests/unit/specs/components/Dismissable/DismissableToastBody.spec.js > DismissableToastBody > uses default link label if linkLabel is not provided |
| 888 | 12 | tests/unit/specs/components/Dismissable/DismissableAlertEditable.spec.js > DismissableAlertEditable.vue > binds modelValue to VariantDropdown |
| 889 | 12 | tests/unit/specs/components/ColumnChartPicker.spec.js > ColumnChartPicker.vue > computes the "aggregatedData" correctly |
| 890 | 12 | tests/unit/specs/api/index.spec.js > Datashare backend client > should call indexPath with "example" as path |
| 891 | 12 | tests/unit/specs/api/elasticsearch.spec.js > elasticsearch > csrfPlugin > should not add the CSRF header when the cookie is absent |
| 892 | 12 | tests/unit/specs/api/elasticsearch.spec.js > elasticsearch > csrfPlugin > should add the CSRF header when the cookie is set |
| 893 | 11 | tests/unit/specs/views/Project/ProjectView/ProjectViewEdit/ProjectViewEdit.spec.js > ProjectViewEdit.vue > first tab links to project.view.edit.details |
| 894 | 11 | tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js > DocumentViewTabsViewer.vue > should call the DocumentViewerLegacySpreadsheet component for CSV document |
| 895 | 11 | tests/unit/specs/store/modules/search.spec.js > SearchStore > Sort filter > this filter should have one sorted filter |
| 896 | 11 | tests/unit/specs/store/modules/hooks.spec.js > HooksStore > should register hooked components |
| 897 | 11 | tests/unit/specs/store/modules/document.spec.js > DocumentStore > Manage isRecommended status > should change isRecommended status to false |
| 898 | 11 | tests/unit/specs/core/HooksMixin.spec.js > HooksMixin > should unregister all components on a hook |
| 899 | 11 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > fetchRepository > should handle repository fetch error |
| 900 | 11 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > createSnapshot > should call API to create snapshot without version when ES info fails |
| 901 | 11 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsList.spec.js > SettingsSnapshotsList > should display empty state when no snapshots and not loading |
| 902 | 11 | tests/unit/specs/components/Project/ProjectLink.spec.js > ProjectLink.vue > should be instanciated with an object instead of a project name |
| 903 | 11 | tests/unit/specs/components/PageHeader/PageHeaderToolbar.spec.js > PageHeaderToolbar.vue > should NOT display a tiny-pagination by default |
| 904 | 11 | tests/unit/specs/components/Mode/ModeLocalOnly.spec.js > ModeLocalOnly.vue > when the initial mode is `LOCAL` and props strict is true > should hide "foo" reactivly in `SERVER` |
| 905 | 11 | tests/unit/specs/components/Mode/ModeLocalOnly.spec.js > ModeLocalOnly.vue > when the initial mode is `LOCAL` and props strict is true > should hide "foo" reactivly in `EMBEDDED` |
| 906 | 11 | tests/unit/specs/components/Mode/ModeLocalOnly.spec.js > ModeLocalOnly.vue > when the initial mode is `EMBEDDED` > should show "foo" reactivly in `LOCAL` |
| 907 | 11 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryHeader.spec.js > DocumentThreadEntryHeader.vue > should always show DocumentThreadEntryHeaderFrom |
| 908 | 11 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryHeaderFrom.spec.js > DocumentThreadEntryHeaderFrom.vue > should use strong tag for DisplayEmail |
| 909 | 11 | tests/unit/specs/components/Dismissable/DismissableContentWarningToggler.spec.js > DismissableContentWarningToggler.vue > emits update:modelValue with true when modelValue is false and button is clicked |
| 910 | 11 | tests/unit/specs/api/elasticsearch.spec.js > elasticsearch > should build a simple ES query and escape slash in it |
| 911 | 11 | tests/unit/specs/api/elasticsearch.spec.js > elasticsearch > csrfPlugin > should preserve existing headers when adding the CSRF header |
| 912 | 10 | tests/unit/specs/store/modules/document.spec.js > DocumentStore > Manage isRecommended status > should remove user from recommendedBy array |
| 913 | 10 | tests/unit/specs/store/modules/documentPathBanners.spec.js > DocumentPathBannersStore > should call the getPathBanners url |
| 914 | 10 | tests/unit/specs/router/guards.spec.js > guards > checkUserRole > should skip role check in LOCAL mode |
| 915 | 10 | tests/unit/specs/router/guards.spec.js > guards > checkUserRole > should redirect to error when user lacks ADMIN role |
| 916 | 10 | tests/unit/specs/router/guards.spec.js > guards > checkUserRole > should redirect to error when user has no policy for the project |
| 917 | 10 | tests/unit/specs/router/guards.spec.js > guards > checkUserRole > should check roles for the correct project from route params |
| 918 | 10 | tests/unit/specs/router/guards.spec.js > guards > checkMode > should redirect settings.api to error in LOCAL mode |
| 919 | 10 | tests/unit/specs/router/guards.spec.js > guards > checkMode > should redirect project.new to error in SERVER mode |
| 920 | 10 | tests/unit/specs/router/guards.spec.js > guards > checkMode > should not redirect project.new to error in EMBEDDED mode |
| 921 | 10 | tests/unit/specs/core/WidgetsMixin.spec.js > WidgetsMixin > should find 2 widgets |
| 922 | 10 | tests/unit/specs/composables/useNProgress.spec.js > useNProgress > should not be in loading state after `done` is called |
| 923 | 10 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > hasSinglePath > should return false when no paths are available |
| 924 | 10 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > hasSinglePath > should return false when multiple paths are available |
| 925 | 10 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > hasAvailablePaths > should return false when no paths are available |
| 926 | 10 | tests/unit/specs/composables/useDocumentDownload.spec.js > useDocumentDownload composable > hasTranslations > should be true when API returns translations |
| 927 | 10 | tests/unit/specs/composables/useDocumentDownload.spec.js > useDocumentDownload composable > downloadTranslatedContent > should call getContent when content is not loaded |
| 928 | 10 | tests/unit/specs/components/Widget/WidgetNested.spec.js > WidgetNested.vue > has two nested widgets |
| 929 | 10 | tests/unit/specs/components/Task/TaskActions.spec.js > Task Actions > does not emit delete-done when there is no done tasks |
| 930 | 10 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshots.spec.js > SettingsSnapshots > when repository is not configured > should emit createRepository event from setup |
| 931 | 10 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsSetup.spec.js > SettingsSnapshotsSetup > no paths available state > should not display form when no paths available |
| 932 | 10 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsSetup.spec.js > SettingsSnapshotsSetup > loading state > should display loading spinner when paths are not loaded |
| 933 | 10 | tests/unit/specs/components/Project/ProjectThumbnail.spec.js > ProjectThumbnail.vue > should display a caption using the label |
| 934 | 10 | tests/unit/specs/components/Project/ProjectThumbnail.spec.js > ProjectThumbnail.vue > should display a caption even with short name |
| 935 | 10 | tests/unit/specs/components/Project/ProjectLink.spec.js > ProjectLink.vue > should be a router link |
| 936 | 10 | tests/unit/specs/components/PathBanner/PathBannersListEntry.spec.js > PathBannersListEntry.vue > emits banner:delete with the index when delete button is clicked |
| 937 | 10 | tests/unit/specs/components/PageHeader/PageHeaderToolbar.spec.js > PageHeaderToolbar.vue > should NOT display a button-toggle-filters by default |
| 938 | 10 | tests/unit/specs/components/Mode/ModeLocalOnly.spec.js > ModeLocalOnly.vue > when the initial mode is `SERVER` > should show "foo" reactivly in `LOCAL` |
| 939 | 10 | tests/unit/specs/components/Mode/ModeLocalOnly.spec.js > ModeLocalOnly.vue > when the initial mode is `SERVER` > should not display "foo" |
| 940 | 10 | tests/unit/specs/components/Mode/ModeLocalOnly.spec.js > ModeLocalOnly.vue > when the initial mode is `EMBEDDED` > should hide "foo" reactivly in `SERVER` |
| 941 | 10 | tests/unit/specs/components/Form/FormFieldset/FormFieldset.spec.js > FormFieldset.vue > compact prop override > renders without error when compact prop is not provided |
| 942 | 10 | tests/unit/specs/components/Filter/FilterType/FilterTypeAll.spec.js > FilterTypeAll.vue > always hides the count |
| 943 | 10 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryHeaderTo.spec.js > DocumentThreadEntryHeaderTo.vue > should render a single recipient |
| 944 | 10 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryHeader.spec.js > DocumentThreadEntryHeader.vue > should not show DocumentThreadEntryExcerpt when expanded |
| 945 | 10 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryHeaderCreationDate.spec.js > DocumentThreadEntryHeaderCreationDate.vue > should not render a router-link when creationDate is missing |
| 946 | 10 | tests/unit/specs/components/Display/DisplayVersion.spec.js > DisplayVersion > should have empty class when no value |
| 947 | 10 | tests/unit/specs/components/Display/DisplaySnapshotVersion.spec.js > DisplaySnapshotVersion > should use DisplayVersion component under the hood |
| 948 | 10 | tests/unit/specs/components/Display/DisplaySnapshotVersion.spec.js > DisplaySnapshotVersion > should extract and display version from snapshot name |
| 949 | 10 | tests/unit/specs/components/Dismissable/DismissableToastBody.spec.js > DismissableToastBody > renders title if provided |
| 950 | 10 | tests/unit/specs/components/Dismissable/DismissableContentWarningToggler.spec.js > DismissableContentWarningToggler.vue > renders the description prop when provided |
| 951 | 10 | tests/unit/specs/components/Dismissable/DismissableAlertEditable.spec.js > DismissableAlertEditable.vue > renders DismissableInputEditable |
| 952 | 10 | tests/unit/specs/components/Dismissable/DismissableAlertEditable.spec.js > DismissableAlertEditable.vue > passes placeholder to DismissableInputEditable |
| 953 | 10 | tests/unit/specs/components/BatchDownload/BatchDownloadConfirmModal.spec.js > BatchDownloadConfirmModal.vue > renders the unknown-truncation variant when estimates are null |
| 954 | 10 | tests/unit/specs/api/elasticsearch.spec.js > elasticsearch > estimateDownloadSize > returns the estimated count and size from the response |
| 955 | 10 | tests/unit/specs/api/elasticsearch.spec.js > elasticsearch > estimateDownloadSize > defaults estimated count and size to 0 when fields are missing |
| 956 | 9 | tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsEntities.spec.js > DocumentViewTabsEntities.vue > with mocking the API > should call the api to get named entities |
| 957 | 9 | tests/unit/specs/store/modules/insights.spec.js > InsightsStore > should return a list of instantiated widgets |
| 958 | 9 | tests/unit/specs/store/modules/document.spec.js > DocumentStore > Manage isRecommended status > should add user in recommendedBy array |
| 959 | 9 | tests/unit/specs/core/HooksMixin.spec.js > HooksMixin > should find one hooked components by its target name on the current project |
| 960 | 9 | tests/unit/specs/core/HooksMixin.spec.js > HooksMixin > should find no hooked components on the current project |
| 961 | 9 | tests/unit/specs/core/Core.spec.js > Core > should instantiate the Core class using a static method |
| 962 | 9 | tests/unit/specs/core/Core.spec.js > Core > Call useAll on Core > should set policies in config from getUserPermissions after loadUser |
| 963 | 9 | tests/unit/specs/core/Core.spec.js > Core > Call useAll on Core > should expose the config from Murmur |
| 964 | 9 | tests/unit/specs/core/ComponentsMixin.spec.js > ComponentsMixin > should find component by name with wrong case |
| 965 | 9 | tests/unit/specs/core/ComponentsMixin.spec.js > ComponentsMixin > should find component by name with kebab case |
| 966 | 9 | tests/unit/specs/core/ComponentsMixin.spec.js > ComponentsMixin > Murmur components > should return null for unknown Murmur component |
| 967 | 9 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > hasAvailablePaths > should return true when paths are available |
| 968 | 9 | tests/unit/specs/composables/useDocumentDownload.spec.js > useDocumentDownload composable > hasTranslations > should be false when API returns no translations |
| 969 | 9 | tests/unit/specs/components/Task/TaskActions.spec.js > Task Actions > emits delete-done on clicking delete done tasks |
| 970 | 9 | tests/unit/specs/components/Search/SearchBar/SearchBarInputDropdown.spec.js > SearchBarInputDropdown.vue > should display a dropdown with 2 options fields |
| 971 | 9 | tests/unit/specs/components/Project/ProjectThumbnail.spec.js > ProjectThumbnail.vue > should not be checked by default |
| 972 | 9 | tests/unit/specs/components/Project/ProjectThumbnail.spec.js > ProjectThumbnail.vue > should hide the caption when `noCaption` is set |
| 973 | 9 | tests/unit/specs/components/Project/ProjectThumbnail.spec.js > ProjectThumbnail.vue > should have a default width of 100% |
| 974 | 9 | tests/unit/specs/components/Project/ProjectThumbnail.spec.js > ProjectThumbnail.vue > should display a caption even with short label |
| 975 | 9 | tests/unit/specs/components/Project/ProjectThumbnail.spec.js > ProjectThumbnail.vue > should display a caption even when no consonants in name, with max 3 chars |
| 976 | 9 | tests/unit/specs/components/Mode/ModeServerOnly.spec.js > ModeServerOnly.vue > when the initial mode is `SERVER` > should hide "foo" reactivly in `EMBEDDED` |
| 977 | 9 | tests/unit/specs/components/Mode/ModeLocalOnly.spec.js > ModeLocalOnly.vue > when the initial mode is `EMBEDDED` > should display "foo" |
| 978 | 9 | tests/unit/specs/components/Hook/Hook.spec.js > Hook.vue > should have two components in reverse order |
| 979 | 9 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntry.spec.js > DocumentThreadEntry.vue > should not add active class when active prop is false |
| 980 | 9 | tests/unit/specs/components/Document/DocumentThread/DocumentThreadEntryHeaderTo.spec.js > DocumentThreadEntryHeaderTo.vue > should render a DisplayEmail for each recipient |
| 981 | 9 | tests/unit/specs/components/Document/DocumentPathBanners.spec.js > DocumentPathBanners.vue > should display path banner on document with default variant: warning |
| 982 | 9 | tests/unit/specs/components/Display/DisplayVersion.spec.js > DisplayVersion > should display dash when value is not provided |
| 983 | 9 | tests/unit/specs/components/Display/DisplayUserAvatar.spec.js > DisplayUserAvatar.vue > should display an icon with a data-abbr attribute |
| 984 | 9 | tests/unit/specs/components/Display/DisplaySnapshotVersion.spec.js > DisplaySnapshotVersion > should display version when no distribution in name |
| 985 | 9 | tests/unit/specs/components/Display/DisplaySnapshotDistribution.spec.js > DisplaySnapshotDistribution > should default to Elasticsearch when only name in snapshot |
| 986 | 9 | tests/unit/specs/components/Display/DisplayEsDistribution.spec.js > DisplayEsDistribution > should display "Elasticsearch" for elasticsearch distribution |
| 987 | 9 | tests/unit/specs/components/Dismissable/DismissableContentWarningToggler.spec.js > DismissableContentWarningToggler.vue > renders a custom description slot |
| 988 | 9 | tests/unit/specs/api/elasticsearch.spec.js > elasticsearch > rootSearch > passes operator to default_operator in the body |
| 989 | 9 | tests/unit/specs/api/elasticsearch.spec.js > elasticsearch > estimateDownloadSize > builds a query with size 0, track_total_hits and a sum aggregation on contentLength |
| 990 | 8 | tests/unit/specs/views/Project/ProjectView/ProjectViewEdit/ProjectViewEdit.spec.js > ProjectViewEdit.vue > second tab links to project.view.edit.banners |
| 991 | 8 | tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js > DocumentViewTabsViewer.vue > should call the DocumentViewerVideo component for video document |
| 992 | 8 | tests/unit/specs/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer.spec.js > DocumentViewTabsViewer.vue > should call the DocumentViewerAudio component for audio document |
| 993 | 8 | tests/unit/specs/router/guards.spec.js > guards > checkMode > should not redirect routes without allowedModes |
| 994 | 8 | tests/unit/specs/core/ProjectsMixin.spec.js > ProjectsMixin > should create the default project |
| 995 | 8 | tests/unit/specs/core/HooksMixin.spec.js > HooksMixin > should reset all hooks |
| 996 | 8 | tests/unit/specs/core/ComponentsMixin.spec.js > ComponentsMixin > should find component in sub-folder |
| 997 | 8 | tests/unit/specs/core/ComponentsMixin.spec.js > ComponentsMixin > Murmur components > should throw an exception for unknown Murmur component with getComponent |
| 998 | 8 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > fetchAvailablePaths > should handle API errors gracefully |
| 999 | 8 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshots.spec.js > SettingsSnapshots > when repository is not configured > should not show create button |
| 1000 | 8 | tests/unit/specs/components/Settings/SettingsSnapshots/SettingsSnapshotsSetup.spec.js > SettingsSnapshotsSetup > loading state > should not display form when loading |
| 1001 | 8 | tests/unit/specs/components/Project/ProjectThumbnail.spec.js > ProjectThumbnail.vue > should use a custom width when `width` is set |
| 1002 | 8 | tests/unit/specs/components/Project/ProjectThumbnail.spec.js > ProjectThumbnail.vue > should display a caption even when no consonant in name |
| 1003 | 8 | tests/unit/specs/components/PathBanner/PathBanner.spec.js > PathBanner.vue > renders DismissableContentWarningToggler when sensitive is true |
| 1004 | 8 | tests/unit/specs/components/Mode/ModeServerOnly.spec.js > ModeServerOnly.vue > when the initial mode is `LOCAL` > should show "foo" reactivly in `SERVER` |
| 1005 | 8 | tests/unit/specs/components/Mode/ModeLocalOnly.spec.js > ModeLocalOnly.vue > when the initial mode is `LOCAL` > should hide "foo" reactivly in `SERVER` |
| 1006 | 8 | tests/unit/specs/components/Hook/Hook.spec.js > Hook.vue > should have two components |
| 1007 | 8 | tests/unit/specs/components/Display/DisplaySnapshotVersion.spec.js > DisplaySnapshotVersion > should display dash when only distribution in snapshot name |
| 1008 | 8 | tests/unit/specs/components/Display/DisplayEsDistribution.spec.js > DisplayEsDistribution > should display "OpenSearch" for opensearch distribution |
| 1009 | 8 | tests/unit/specs/components/Display/DisplayEsDistribution.spec.js > DisplayEsDistribution > should default to elasticsearch when no value provided |
| 1010 | 8 | tests/unit/specs/components/Dismissable/DismissableToastBody.spec.js > DismissableToastBody > uses provided link label if linkLabel is specified |
| 1011 | 8 | tests/unit/specs/components/Dismissable/DismissableToastBody.spec.js > DismissableToastBody > applies the correct class to the link based on the variant |
| 1012 | 8 | tests/unit/specs/components/ColumnChartPicker.spec.js > ColumnChartPicker.vue > computes the "intervalDatesExtent" correctly |
| 1013 | 8 | tests/unit/specs/components/BatchDownload/BatchDownloadConfirmModal.spec.js > BatchDownloadConfirmModal.vue > renders the unknown-truncation variant when estimate props are omitted |
| 1014 | 7 | tests/unit/specs/store/modules/wait.spec.js > WaitStore > should set and get a loader value for the global scope when scope is null |
| 1015 | 7 | tests/unit/specs/store/modules/task.spec.js > TaskStore > should define a store module |
| 1016 | 7 | tests/unit/specs/store/modules/app.spec.js > AppStore > should have an initial state with an empty projects array |
| 1017 | 7 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should return the same store |
| 1018 | 7 | tests/unit/specs/core/ProjectsMixin.spec.js > ProjectsMixin > should update an existing project in the settings |
| 1019 | 7 | tests/unit/specs/core/ProjectsMixin.spec.js > ProjectsMixin > should call a function when a project is selected with another |
| 1020 | 7 | tests/unit/specs/core/I18nMixin.spec.js > I18nMixin > without language in local storage > should save the "es" local in local storage |
| 1021 | 7 | tests/unit/specs/core/I18nMixin.spec.js > I18nMixin > with german language in local storage > should have "ja" messages |
| 1022 | 7 | tests/unit/specs/core/Core.spec.js > Core > Call useAll on Core > should return empty string if user has no projects |
| 1023 | 7 | tests/unit/specs/composables/useTaskPolling.spec.js > useTaskPolling > should send args.batchRecord.name filter when searchQuery has a value |
| 1024 | 7 | tests/unit/specs/composables/useTaskPolling.spec.js > useTaskPolling > should not send args.batchRecord.name filter when searchQuery is null |
| 1025 | 7 | tests/unit/specs/composables/useOnce.spec.js > useOnce > returns reactive state and helpers |
| 1026 | 7 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > parseSnapshotName > should parse snapshot name without version or distribution and default to elasticsearch |
| 1027 | 7 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > fetchAvailablePaths > should handle empty nodes |
| 1028 | 7 | tests/unit/specs/composables/useBatchDownloadEstimation.spec.js > useBatchDownloadEstimation composable > resets loading to false and propagates errors when estimate() rejects |
| 1029 | 7 | tests/unit/specs/composables/refWhenever.spec.js > refWhenever > should set triggered to false when value changes with a condition |
| 1030 | 7 | tests/unit/specs/components/Project/ProjectLink.spec.js > ProjectLink.vue > should hide the project thumbnail when `hideThumbnail` is set |
| 1031 | 7 | tests/unit/specs/components/PathBanner/PathBanner.spec.js > PathBanner.vue > does not render DismissableContentWarningToggler when sensitive is false |
| 1032 | 7 | tests/unit/specs/components/Mode/ModeServerOnly.spec.js > ModeServerOnly.vue > when the initial mode is `EMBEDDED` > should not display "foo" |
| 1033 | 7 | tests/unit/specs/components/Mode/ModeLocalOnly.spec.js > ModeLocalOnly.vue > when the initial mode is `LOCAL` and props strict is true > should display "foo" |
| 1034 | 7 | tests/unit/specs/components/Hook/Hook.spec.js > Hook.vue > should have two ordered components |
| 1035 | 7 | tests/unit/specs/components/Hook/Hook.spec.js > Hook.vue > should have one components, without the other |
| 1036 | 7 | tests/unit/specs/components/Form/FormFieldset/FormFieldset.spec.js > FormFieldset.vue > compact prop override > passes null description to BFormGroup when compact=false |
| 1037 | 7 | tests/unit/specs/components/Display/DisplaySnapshotVersion.spec.js > DisplaySnapshotVersion > should display dash when no version in snapshot name |
| 1038 | 7 | tests/unit/specs/api/resources/Document.spec.js > Document > should display tags |
| 1039 | 7 | tests/unit/specs/api/elasticsearch.spec.js > elasticsearch > estimateDownloadSize > passes operator to default_operator in the query body |
| 1040 | 6 | tests/unit/specs/store/modules/searchBreadcrumb.spec.js > SearchBreadcrumbStore > computes the journey diffs correctly |
| 1041 | 6 | tests/unit/specs/store/modules/pipelines.spec.js > PipelinesStore > should found a pipeline by its name |
| 1042 | 6 | tests/unit/specs/store/filters/FilterEntity.spec.js > FilterEntity.js > should filter on existing category |
| 1043 | 6 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should create a store with a suffix factory that can be used with `mapState` in a component |
| 1044 | 6 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should create a store factory with a suffix that can be used with `mapStores` in a component |
| 1045 | 6 | tests/unit/specs/router/guards.spec.js > guards > checkMode > should redirect task.documents.list to error in SERVER mode |
| 1046 | 6 | tests/unit/specs/core/ProjectsMixin.spec.js > ProjectsMixin > should call a function twice when a project is selected |
| 1047 | 6 | tests/unit/specs/core/PipelinesMixin.spec.js > PipelinesMixin > should find one pipeline by its category on the current project |
| 1048 | 6 | tests/unit/specs/core/I18nMixin.spec.js > I18nMixin > without language in local storage > should have "en" messages |
| 1049 | 6 | tests/unit/specs/core/ComponentsMixin.spec.js > ComponentsMixin > should find component by name with underscore case |
| 1050 | 6 | tests/unit/specs/composables/useWait.spec.js > useWait composable > wraps an async function with waitFor, toggling loader state appropriately |
| 1051 | 6 | tests/unit/specs/composables/useWait.spec.js > useWait composable > uses a custom loader id when waitFor is called with a string id |
| 1052 | 6 | tests/unit/specs/composables/useWait.spec.js > useWait composable > throws an error if waitFor is called with an invalid argument |
| 1053 | 6 | tests/unit/specs/composables/useWait.spec.js > useWait composable > sets loader to true when start is called and to false when end is called |
| 1054 | 6 | tests/unit/specs/composables/useSelection.spec.js > useSelection > should initialize with an empty selection |
| 1055 | 6 | tests/unit/specs/composables/useKeyboardShortcuts.spec.js > useKeyboardShortcuts > should get all the shortcuts with a ref |
| 1056 | 6 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > parseSnapshotName > should parse snapshot name with version only and default to elasticsearch |
| 1057 | 6 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > parseSnapshotName > should parse snapshot name with version and distribution |
| 1058 | 6 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > parseSnapshotName > should parse snapshot name with distribution only |
| 1059 | 6 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > fetchAvailablePaths > should handle single path as string |
| 1060 | 6 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > fetchAvailablePaths > should handle missing path.repo |
| 1061 | 6 | tests/unit/specs/composables/useElementObserver.spec.js > useElementObserver > resolves when element is created later (created) |
| 1062 | 6 | tests/unit/specs/composables/useBatchDownloadEstimation.spec.js > useBatchDownloadEstimation composable > exposes maxNbFiles and maxSizeBytes from core config |
| 1063 | 6 | tests/unit/specs/composables/useBatchDownloadEstimation.spec.js > useBatchDownloadEstimation composable > estimate() populates estimatedCount and estimatedSize from the search store |
| 1064 | 6 | tests/unit/specs/composables/refWhenever.spec.js > refWhenever > should set triggered to false when value changes and stay false with a condition |
| 1065 | 6 | tests/unit/specs/components/PathBanner/PathBanner.spec.js > PathBanner.vue > passes variant to DismissableAlert |
| 1066 | 6 | tests/unit/specs/components/Mode/ModeServerOnly.spec.js > ModeServerOnly.vue > when the initial mode is `LOCAL` > should not display "foo" |
| 1067 | 6 | tests/unit/specs/components/Mode/ModeLocalOnly.spec.js > ModeLocalOnly.vue > when the initial mode is `LOCAL` > should show "foo" reactivly in `EMBEDDED` |
| 1068 | 6 | tests/unit/specs/components/Entity/EntityButton.spec.js > EntityButton.vue > should display show 2 entity occurrences |
| 1069 | 6 | tests/unit/specs/components/Entity/EntityButton.spec.js > EntityButton.vue > should display mention text "Riri" |
| 1070 | 6 | tests/unit/specs/components/Display/DisplaySnapshotDistribution.spec.js > DisplaySnapshotDistribution > should use DisplayEsDistribution component under the hood |
| 1071 | 6 | tests/unit/specs/components/Display/DisplaySnapshotDistribution.spec.js > DisplaySnapshotDistribution > should extract and display OpenSearch distribution |
| 1072 | 6 | tests/unit/specs/components/Display/DisplayPath.spec.js > DisplayPath > should have the correct CSS class |
| 1073 | 6 | tests/unit/specs/components/ColumnChartPicker.spec.js > ColumnChartPicker.vue > computes the "startYear" correctly |
| 1074 | 6 | tests/unit/composables/usePolicies.spec.js > usePolicies > getRoleByProject returns roles for known project |
| 1075 | 5 | tests/unit/specs/utils/highlight.spec.js > Highlight > should hightlight one "foo" |
| 1076 | 5 | tests/unit/specs/store/modules/task.spec.js > TaskStore > should delete done tasks |
| 1077 | 5 | tests/unit/specs/store/modules/hooks.spec.js > HooksStore > should unregister all components on a hook |
| 1078 | 5 | tests/unit/specs/store/modules/documentDownload.spec.js > DocumentDownloadStore > not allowed download > should get the download status for the given index |
| 1079 | 5 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should create a store with a different id than the default search store |
| 1080 | 5 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should create a store factory that can be used with `mapState` in a component |
| 1081 | 5 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should create a disposable store that is not persisted in pinia registry after component is unmounted |
| 1082 | 5 | tests/unit/specs/core/WidgetsMixin.spec.js > WidgetsMixin > should have arbitrary ordered widgets |
| 1083 | 5 | tests/unit/specs/core/PipelinesMixin.spec.js > PipelinesMixin > should find no pipeline on the current project |
| 1084 | 5 | tests/unit/specs/core/I18nMixin.spec.js > I18nMixin > without language in local storage > should have "es" message |
| 1085 | 5 | tests/unit/specs/core/I18nMixin.spec.js > I18nMixin > with german language in local storage > should save the "ja" local in local storage |
| 1086 | 5 | tests/unit/specs/core/I18nMixin.spec.js > I18nMixin > with german language in local storage > should have "de" messages |
| 1087 | 5 | tests/unit/specs/core/ComponentsMixin.spec.js > ComponentsMixin > Murmur components > should find Murmur datavisualisations component |
| 1088 | 5 | tests/unit/specs/composables/useWait.spec.js > useWait composable > uses the component instance uid as scope key when scoped is true |
| 1089 | 5 | tests/unit/specs/composables/useUrlParam.spec.js > useUrlParamWithStore > should update store when query parameter changes |
| 1090 | 5 | tests/unit/specs/composables/useUrlParam.spec.js > useUrlParams > should update the query parameters when the values change |
| 1091 | 5 | tests/unit/specs/composables/useUrlParam.spec.js > useUrlParams > should sync multiple query parameters with the initial values |
| 1092 | 5 | tests/unit/specs/composables/useUrlParam.spec.js > useUrlParams > should fallback to the initial values if query parameters are missing |
| 1093 | 5 | tests/unit/specs/composables/useUrlParam.spec.js > useUrlPageFrom > should update the page to 2 |
| 1094 | 5 | tests/unit/specs/composables/useUrlParam.spec.js > useUrlPageFrom > should update the page to 11 |
| 1095 | 5 | tests/unit/specs/composables/useUrlParam.spec.js > useUrlPageFrom > should update the from parameter to 100 |
| 1096 | 5 | tests/unit/specs/composables/useOnce.spec.js > useOnce > retries after a failure (does not cache rejections) |
| 1097 | 5 | tests/unit/specs/composables/useMode.spec.js > useMode > should return correct computed values |
| 1098 | 5 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > add > should register a static dependency with a getter |
| 1099 | 5 | tests/unit/specs/composables/useDocumentEntryMemo.spec.js > useDocumentEntryMemo > addProperties > should add properties as a memo dependency |
| 1100 | 5 | tests/unit/specs/composables/useDataDir.spec.js > useDataDir > dataDir > should return the default data directory |
| 1101 | 5 | tests/unit/specs/composables/useBatchDownloadEstimation.spec.js > useBatchDownloadEstimation composable > toggles loading during the estimate() call |
| 1102 | 5 | tests/unit/specs/composables/useBatchDownloadEstimation.spec.js > useBatchDownloadEstimation composable > exceedsSizeLimit reflects estimatedSize > maxSizeBytes |
| 1103 | 5 | tests/unit/specs/composables/useBatchDownloadEstimation.spec.js > useBatchDownloadEstimation composable > exceedsLimit is false when neither limit is exceeded |
| 1104 | 5 | tests/unit/specs/composables/useBatchDownloadEstimation.spec.js > useBatchDownloadEstimation composable > exceedsFileLimit reflects estimatedCount > maxNbFiles |
| 1105 | 5 | tests/unit/specs/composables/refWhenever.spec.js > refWhenever > should set triggered to true when value changes and stay true |
| 1106 | 5 | tests/unit/specs/components/PathBanner/PathBanner.spec.js > PathBanner.vue > renders the note text |
| 1107 | 5 | tests/unit/specs/components/PathBanner/PathBanner.spec.js > PathBanner.vue > defaults variant to "info" |
| 1108 | 5 | tests/unit/specs/components/Display/DisplayVersion.spec.js > DisplayVersion > should display the version value |
| 1109 | 5 | tests/unit/specs/components/Display/DisplaySnapshotName.spec.js > DisplaySnapshotName > should display snapshot name as-is when no version or distribution |
| 1110 | 5 | tests/unit/specs/components/Display/DisplaySnapshotDistribution.spec.js > DisplaySnapshotDistribution > should extract and display Elasticsearch distribution |
| 1111 | 5 | tests/unit/specs/components/Display/DisplaySnapshotDistribution.spec.js > DisplaySnapshotDistribution > should default to Elasticsearch when no distribution in snapshot name |
| 1112 | 5 | tests/unit/specs/components/Display/DisplayPath.spec.js > DisplayPath > should handle paths with special characters |
| 1113 | 5 | tests/unit/specs/components/Display/DisplayPath.spec.js > DisplayPath > should handle deeply nested paths |
| 1114 | 5 | tests/unit/specs/components/Display/DisplayPath.spec.js > DisplayPath > should display the original path when it does not start with dataDir |
| 1115 | 5 | tests/unit/specs/components/Display/DisplayEmpty.spec.js > DisplayEmpty > empty slot > should use custom empty slot content |
| 1116 | 5 | tests/unit/specs/components/ColumnChartPicker.spec.js > ColumnChartPicker.vue > computes the "intervalTimesExtent" correctly |
| 1117 | 5 | tests/unit/specs/components/ColumnChartPicker.spec.js > ColumnChartPicker.vue > computes the "endYear" correctly |
| 1118 | 4 | tests/unit/specs/utils/utils.spec.js > utils > getOS > should retrieve Mac OS |
| 1119 | 4 | tests/unit/specs/utils/strings.spec.js > strings > addLocalSearchMarksClass > should wrap "dolor" (lowercase) with tags in string without HTML |
| 1120 | 4 | tests/unit/specs/utils/esSnapshots.spec.js > esSnapshots utils > formatSnapshotName > should generate a human-readable snapshot name |
| 1121 | 4 | tests/unit/specs/store/modules/searchBreadcrumb.spec.js > SearchBreadcrumbStore > pushs duplicate queries if the last step is different |
| 1122 | 4 | tests/unit/specs/store/modules/searchBreadcrumb.spec.js > SearchBreadcrumbStore > preserves the order or addition in the end step |
| 1123 | 4 | tests/unit/specs/store/modules/searchBreadcrumb.spec.js > SearchBreadcrumbStore > does not push duplicate queries if the last step is the same |
| 1124 | 4 | tests/unit/specs/store/modules/hooks.spec.js > HooksStore > should register a hooked component |
| 1125 | 4 | tests/unit/specs/store/modules/documentDownload.spec.js > DocumentDownloadStore > not allowed download > should get the download statuses for the two given indices only twice |
| 1126 | 4 | tests/unit/specs/store/modules/documentDownload.spec.js > DocumentDownloadStore > not allowed download > should get the download statuses for the two given indices in an array |
| 1127 | 4 | tests/unit/specs/store/modules/documentDownload.spec.js > DocumentDownloadStore > not allowed download > should get the download statuses for the two given indices |
| 1128 | 4 | tests/unit/specs/store/modules/documentDownload.spec.js > DocumentDownloadStore > not allowed download > should get the download statuses for the given index only once |
| 1129 | 4 | tests/unit/specs/store/hooks/HookedComponent.spec.js > HookedComponent > should have an target attribute |
| 1130 | 4 | tests/unit/specs/store/filters/FilterPath.spec.js > FilterPath.js > should add slash to path in json if path doesnt have one |
| 1131 | 4 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should create a store with a different state |
| 1132 | 4 | tests/unit/specs/core/WidgetsMixin.spec.js > WidgetsMixin > should find one widget on the current project |
| 1133 | 4 | tests/unit/specs/core/ProjectsMixin.spec.js > ProjectsMixin > should call a function twice when a project is selected with another |
| 1134 | 4 | tests/unit/specs/core/ProjectsMixin.spec.js > ProjectsMixin > should add a new project to the settings |
| 1135 | 4 | tests/unit/specs/core/I18nMixin.spec.js > I18nMixin > without language in local storage > should save the "en" local in local storage by default |
| 1136 | 4 | tests/unit/specs/core/I18nMixin.spec.js > I18nMixin > without language in local storage > should not have "fr" messages |
| 1137 | 4 | tests/unit/specs/core/ComponentsMixin.spec.js > ComponentsMixin > Murmur components > should find Murmur component by name |
| 1138 | 4 | tests/unit/specs/composables/useUrlParam.spec.js > whenIsRoute > should call the callback when the route name matches |
| 1139 | 4 | tests/unit/specs/composables/useUrlParam.spec.js > useUrlParamWithStore > should update query parameter when store value changes |
| 1140 | 4 | tests/unit/specs/composables/useUrlParam.spec.js > useUrlParamWithStore > should fallback to store value if query parameter is missing |
| 1141 | 4 | tests/unit/specs/composables/useUrlParam.spec.js > useUrlParamsWithStore > should update store when query parameters change |
| 1142 | 4 | tests/unit/specs/composables/useUrlParam.spec.js > useUrlParamsWithStore > should update query parameters when store values change |
| 1143 | 4 | tests/unit/specs/composables/useUrlParam.spec.js > useUrlParamsWithStore > should sync multiple query parameters with store getter |
| 1144 | 4 | tests/unit/specs/composables/useUrlParam.spec.js > useUrlParamsWithStore > should fallback to store values if query parameters are missing |
| 1145 | 4 | tests/unit/specs/composables/useUrlParam.spec.js > useUrlParam > should update the query parameter when the value changes |
| 1146 | 4 | tests/unit/specs/composables/useUrlParam.spec.js > useUrlParam > should fallback to the initial value if query parameter is missing |
| 1147 | 4 | tests/unit/specs/composables/useUrlParam.spec.js > useUrlPageFrom > should use updated perPage when perPage is a ref |
| 1148 | 4 | tests/unit/specs/composables/useUrlParam.spec.js > useUrlPageFrom > should update the page to 2, even with a string parameter |
| 1149 | 4 | tests/unit/specs/composables/useUrlParam.spec.js > useUrlPageFrom > should update the from parameter to 1900 |
| 1150 | 4 | tests/unit/specs/composables/useUrlParam.spec.js > useUrlPageFrom > should calculate correct page number when perPage ref changes |
| 1151 | 4 | tests/unit/specs/composables/useUrlParam.spec.js > replaceUrlParam > should do nothing if the "from" parameter does not exist |
| 1152 | 4 | tests/unit/specs/composables/usePaths.spec.js > usePath > returns the same ref instance passed in |
| 1153 | 4 | tests/unit/specs/composables/useOnce.spec.js > useOnce > calls only once and caches the first successful result |
| 1154 | 4 | tests/unit/specs/composables/useNProgress.spec.js > useNProgress > should toggle the progress explicitely to hide it |
| 1155 | 4 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > getAll > should return all static dependency values |
| 1156 | 4 | tests/unit/specs/composables/useKeyboardShortcuts.spec.js > useKeyboardShortcuts > should get the route shortcuts for `search`route reactivly |
| 1157 | 4 | tests/unit/specs/composables/useEsSnapshots.spec.js > useEsSnapshots composable > parseSnapshotName > should handle null input |
| 1158 | 4 | tests/unit/specs/composables/refWhenever.spec.js > refWhenever > should set triggered to true when value changes |
| 1159 | 4 | tests/unit/specs/composables/refWhenever.spec.js > refWhenever > should set triggered to true when condition is already met |
| 1160 | 4 | tests/unit/specs/composables/awaitWhenever.spec.js > awaitWhenever > synchronous fn > calls fn synchronously when condition fn returns false |
| 1161 | 4 | tests/unit/specs/components/Widget/WidgetNested.spec.js > WidgetNested.vue > has the correct class |
| 1162 | 4 | tests/unit/specs/components/Hook/Hook.spec.js > Hook.vue > should not be in debug mode |
| 1163 | 4 | tests/unit/specs/components/Entity/EntityButton.spec.js > EntityButton.vue > should not display entity occurrences if none |
| 1164 | 4 | tests/unit/specs/components/Display/DisplayVersion.spec.js > DisplayVersion > should display dash when value is null |
| 1165 | 4 | tests/unit/specs/components/Display/DisplaySnapshotName.spec.js > DisplaySnapshotName > should display snapshot name without version only |
| 1166 | 4 | tests/unit/specs/components/Display/DisplaySnapshotName.spec.js > DisplaySnapshotName > should display snapshot name without distribution only |
| 1167 | 4 | tests/unit/specs/components/Display/DisplayPath.spec.js > DisplayPath > should use default empty string when no value provided |
| 1168 | 4 | tests/unit/specs/components/Display/DisplayPath.spec.js > DisplayPath > should display empty string when value is empty |
| 1169 | 4 | tests/unit/specs/components/Display/DisplayEmpty.spec.js > DisplayEmpty > when value is null > should have the empty modifier class |
| 1170 | 4 | tests/unit/specs/components/ColumnChartPicker.spec.js > ColumnChartPicker.vue > executes "isBucketValid" method correctly |
| 1171 | 4 | tests/unit/specs/api/resources/Document.spec.js > Document > should generate the document url |
| 1172 | 4 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to batchSearch |
| 1173 | 4 | tests/unit/specs/api/index.spec.js > Datashare backend client > should call indexPath with ocr true |
| 1174 | 4 | tests/unit/specs/api/index.spec.js > Datashare backend client > executes a default extract (/index) action by calling indexPath with "file" as default |
| 1175 | 3 | tests/unit/specs/utils/humanSize.spec.js > humanSize filter > should return "—" if size equals -1 |
| 1176 | 3 | tests/unit/specs/utils/findPath.spec.js > findPath > should return the correct path for a matching object in an array |
| 1177 | 3 | tests/unit/specs/utils/diff.spec.js > diff > returns correct additions and deletions for simple objects |
| 1178 | 3 | tests/unit/specs/store/modules/task.spec.js > TaskStore > should stop the task named 456 |
| 1179 | 3 | tests/unit/specs/store/modules/task.spec.js > TaskStore > should stop pending tasks |
| 1180 | 3 | tests/unit/specs/store/modules/searchBreadcrumb.spec.js > SearchBreadcrumbStore > returns the correct paramLastIndex for the first param |
| 1181 | 3 | tests/unit/specs/store/modules/searchBreadcrumb.spec.js > SearchBreadcrumbStore > pushes a new query and processes one index correctly, even with a "?" suffix |
| 1182 | 3 | tests/unit/specs/store/modules/searchBreadcrumb.spec.js > SearchBreadcrumbStore > pushes a new query and processes one index correctly, even with a "#/?" suffix |
| 1183 | 3 | tests/unit/specs/store/modules/searchBreadcrumb.spec.js > SearchBreadcrumbStore > pushes a new query and processes indices correctly |
| 1184 | 3 | tests/unit/specs/store/modules/pipelines.spec.js > PipelinesStore > should register 2 pipelines with the category `test-category-foo` |
| 1185 | 3 | tests/unit/specs/store/modules/insights.spec.js > InsightsStore > should register a new widget with a default type |
| 1186 | 3 | tests/unit/specs/store/modules/insights.spec.js > InsightsStore > should register a new widget of type WidgetText |
| 1187 | 3 | tests/unit/specs/store/modules/insights.spec.js > InsightsStore > should register a new widget |
| 1188 | 3 | tests/unit/specs/store/modules/hooks.spec.js > HooksStore > should find a hooked component by its target name |
| 1189 | 3 | tests/unit/specs/store/modules/documentDownload.spec.js > DocumentDownloadStore > not allowed download > should set the download status for the given index |
| 1190 | 3 | tests/unit/specs/store/modules/documentDownload.spec.js > DocumentDownloadStore > not allowed download > should set the download statuses for the two given indices |
| 1191 | 3 | tests/unit/specs/store/modules/documentDownload.spec.js > DocumentDownloadStore > allowed download > should set the download status for the given index |
| 1192 | 3 | tests/unit/specs/store/modules/documentDownload.spec.js > DocumentDownloadStore > allowed download > should set the download statuses for the two given indices |
| 1193 | 3 | tests/unit/specs/store/modules/documentDownload.spec.js > DocumentDownloadStore > allowed download > should get the download status for the given index |
| 1194 | 3 | tests/unit/specs/store/modules/documentDownload.spec.js > DocumentDownloadStore > allowed download > should get the download statuses for the two given indices only twice |
| 1195 | 3 | tests/unit/specs/store/modules/app.spec.js > AppStore > pinProject should add a project to the pins array |
| 1196 | 3 | tests/unit/specs/store/filters/FilterText.spec.js > FilterText.js > pagelessBucketSize > defaults to null when not provided |
| 1197 | 3 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should create twice the same store with an id different than the default search store |
| 1198 | 3 | tests/unit/specs/core/WidgetsMixin.spec.js > WidgetsMixin > should replace an existing widget only on specific project |
| 1199 | 3 | tests/unit/specs/core/WidgetsMixin.spec.js > WidgetsMixin > should replace an existing widget |
| 1200 | 3 | tests/unit/specs/core/WidgetsMixin.spec.js > WidgetsMixin > should have ordered widgets |
| 1201 | 3 | tests/unit/specs/core/WidgetsMixin.spec.js > WidgetsMixin > should find no widgets on the current project |
| 1202 | 3 | tests/unit/specs/core/ProjectsMixin.spec.js > ProjectsMixin > should call a function when a project is unselected |
| 1203 | 3 | tests/unit/specs/core/ProjectsMixin.spec.js > ProjectsMixin > should call a function twice when a project is unselected |
| 1204 | 3 | tests/unit/specs/core/ProjectsMixin.spec.js > ProjectsMixin > should add three new projects to the settings |
| 1205 | 3 | tests/unit/specs/core/ComponentsMixin.spec.js > ComponentsMixin > Murmur components > should get Murmur component directly with getMurmurComponent |
| 1206 | 3 | tests/unit/specs/core/ComponentsMixin.spec.js > ComponentsMixin > Murmur components > should find Murmur maps component |
| 1207 | 3 | tests/unit/specs/composables/useUrlParam.spec.js > replaceUrlParam > should transform the parameter when "to" is a function |
| 1208 | 3 | tests/unit/specs/composables/useUrlParam.spec.js > replaceUrlParam > should replace "from" parameter with "to" when "to" is a string |
| 1209 | 3 | tests/unit/specs/composables/useUrlParam.spec.js > replaceUrlParam > should not do anythng if "to" is neither a string nor a function |
| 1210 | 3 | tests/unit/specs/composables/useUrlParam.spec.js > replaceUrlParam > should not change query if "to" function returns null |
| 1211 | 3 | tests/unit/specs/composables/useUrlParam.spec.js > replaceUrlParam > should not cause infinite loops when replacing |
| 1212 | 3 | tests/unit/specs/composables/useUrlParam.spec.js > replaceUrlParam > should handle multiple replacements |
| 1213 | 3 | tests/unit/specs/composables/useSelection.spec.js > useSelection > should add value to selection |
| 1214 | 3 | tests/unit/specs/composables/useElementObserver.spec.js > useElementObserver > resolves immediately if element already does not exist (destroyed) |
| 1215 | 3 | tests/unit/specs/components/Widget/WidgetNested.spec.js > WidgetNested.vue > renders the component |
| 1216 | 3 | tests/unit/specs/components/Search/SearchBar/SearchBarInputDropdown.spec.js > SearchBarInputDropdown.vue > should display a dropdown with "All fields" selected by default |
| 1217 | 3 | tests/unit/specs/components/Display/DisplaySnapshotName.spec.js > DisplaySnapshotName > should display snapshot name without version and distribution |
| 1218 | 3 | tests/unit/specs/components/Display/DisplayEmpty.spec.js > DisplayEmpty > when value is null > should display dash |
| 1219 | 3 | tests/unit/specs/components/Display/DisplayEmpty.spec.js > DisplayEmpty > when value is not provided > should have the empty modifier class |
| 1220 | 3 | tests/unit/specs/components/Display/DisplayEmpty.spec.js > DisplayEmpty > when value is not provided > should display dash |
| 1221 | 3 | tests/unit/specs/components/Display/DisplayEmpty.spec.js > DisplayEmpty > when value is empty string > should have the empty modifier class |
| 1222 | 3 | tests/unit/specs/components/Display/DisplayEmpty.spec.js > DisplayEmpty > value types > should handle number values |
| 1223 | 3 | tests/unit/specs/components/Display/DisplayEmpty.spec.js > DisplayEmpty > value types > should handle boolean true as a valid value |
| 1224 | 3 | tests/unit/specs/api/resources/Auth.spec.js > auth backend client > getUsername > should return null if user is not authenticated with basic auth |
| 1225 | 3 | tests/unit/specs/api/resources/Auth.spec.js > auth backend client > getAuthenticatedUser > should return null if user is not authenticated |
| 1226 | 3 | tests/unit/specs/api/index.spec.js > Datashare backend client > should throw a 401 if getSettings return a error |
| 1227 | 3 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to getBatchSearches |
| 1228 | 3 | tests/unit/specs/api/index.spec.js > Datashare backend client > should not skip already indexed file when calling indexPath |
| 1229 | 3 | tests/unit/specs/api/index.spec.js > Datashare backend client > should indexPath with "fra" language |
| 1230 | 3 | tests/unit/specs/api/index.spec.js > Datashare backend client > calls index with specified language |
| 1231 | 2 | tests/unit/specs/utils/strings.spec.js > strings > addLocalSearchMarksClass > should wrap "Lorem ipsum" with tags string without HTML even with a toekn in camelcase |
| 1232 | 2 | tests/unit/specs/utils/strings.spec.js > strings > addLocalSearchMarksClass > shouldn't wrap anything |
| 1233 | 2 | tests/unit/specs/utils/strings.spec.js > strings > addLocalSearchMarksClass > should ignore carriage return |
| 1234 | 2 | tests/unit/specs/utils/esSnapshots.spec.js > esSnapshots utils > parseSnapshotName > should parse snapshot name with version and distribution |
| 1235 | 2 | tests/unit/specs/store/modules/searchBreadcrumb.spec.js > SearchBreadcrumbStore > returns the correct paramLastIndex for the second param |
| 1236 | 2 | tests/unit/specs/store/modules/searchBreadcrumb.spec.js > SearchBreadcrumbStore > preserves the order or addition of indices in the end step as a query |
| 1237 | 2 | tests/unit/specs/store/modules/searchBreadcrumb.spec.js > SearchBreadcrumbStore > preserves the order or addition of indices in the end step |
| 1238 | 2 | tests/unit/specs/store/modules/player.spec.js > PlayerStore > should set autoplay to false by default |
| 1239 | 2 | tests/unit/specs/store/modules/pipelines.spec.js > PipelinesStore > should return a list of functions |
| 1240 | 2 | tests/unit/specs/store/modules/pipelines.spec.js > PipelinesStore > should register a pipeline with a name |
| 1241 | 2 | tests/unit/specs/store/modules/pipelines.spec.js > PipelinesStore > should have ordered pipelines |
| 1242 | 2 | tests/unit/specs/store/modules/pipelines.spec.js > PipelinesStore > should found an instantiated pipeline by its name |
| 1243 | 2 | tests/unit/specs/store/modules/pipelines.spec.js > PipelinesStore > should apply a pipeline chain which multiply by 2 |
| 1244 | 2 | tests/unit/specs/store/modules/insights.spec.js > InsightsStore > should restore the state, including the list of widgets |
| 1245 | 2 | tests/unit/specs/store/modules/insights.spec.js > InsightsStore > should have a first widget with `card` and `cols` attributes |
| 1246 | 2 | tests/unit/specs/store/modules/insights.spec.js > InsightsStore > should clear the list of widgets |
| 1247 | 2 | tests/unit/specs/store/modules/hooks.spec.js > HooksStore > should find several hooked components by their target name |
| 1248 | 2 | tests/unit/specs/store/modules/documentPathBanners.spec.js > DocumentPathBannersStore > should filter on document path |
| 1249 | 2 | tests/unit/specs/store/modules/documentPathBanners.spec.js > DocumentPathBannersStore > should call the API endpoint only once |
| 1250 | 2 | tests/unit/specs/store/modules/documentDownload.spec.js > DocumentDownloadStore > allowed download > should get the download statuses for the two given indices in an array |
| 1251 | 2 | tests/unit/specs/store/modules/documentDownload.spec.js > DocumentDownloadStore > allowed download > should get the download statuses for the two given indices |
| 1252 | 2 | tests/unit/specs/store/modules/documentDownload.spec.js > DocumentDownloadStore > allowed download > should get the download statuses for the given index only once |
| 1253 | 2 | tests/unit/specs/store/modules/app.spec.js > AppStore > unpinProject should remove a project from the pins array |
| 1254 | 2 | tests/unit/specs/store/modules/app.spec.js > AppStore > should set settings using an object |
| 1255 | 2 | tests/unit/specs/store/modules/app.spec.js > AppStore > should reset settings to default settings |
| 1256 | 2 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should return the same store when `instantiate` has no params |
| 1257 | 2 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should create twice the same store with an id different than the default search store and share the state |
| 1258 | 2 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should create a store with a defined id |
| 1259 | 2 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should create a store with a closure function |
| 1260 | 2 | tests/unit/specs/core/WidgetsMixin.spec.js > WidgetsMixin > should replace an existing widget and ignore the `name` property |
| 1261 | 2 | tests/unit/specs/core/WidgetsMixin.spec.js > WidgetsMixin > should register a widget for a project only once |
| 1262 | 2 | tests/unit/specs/core/WidgetsMixin.spec.js > WidgetsMixin > should have no widgets after cleaning |
| 1263 | 2 | tests/unit/specs/core/WidgetsMixin.spec.js > WidgetsMixin > should find one unamed widget on the current project |
| 1264 | 2 | tests/unit/specs/core/ProjectsMixin.spec.js > ProjectsMixin > should call the function when a project is selected, then call the other when unselected |
| 1265 | 2 | tests/unit/specs/core/ComponentsMixin.spec.js > ComponentsMixin > Murmur components > should return null for unknown component with getMurmurComponent |
| 1266 | 2 | tests/unit/specs/composables/useUrlParam.spec.js > whenIsRoute > should not call the callback when the route name does not match |
| 1267 | 2 | tests/unit/specs/composables/useUrlParam.spec.js > whenIsRoute > should always call the callback when no name is provided |
| 1268 | 2 | tests/unit/specs/composables/useUrlParam.spec.js > whenDifferentRoute > should not call the callback when the route name matches |
| 1269 | 2 | tests/unit/specs/composables/useUrlParam.spec.js > whenDifferentRoute > should not call the callback when no name is provided |
| 1270 | 2 | tests/unit/specs/composables/useUrlParam.spec.js > whenDifferentRoute > should call the callback when the route name does not match |
| 1271 | 2 | tests/unit/specs/composables/usePaths.spec.js > usePath > selectPath > replaces selection when multiple=false (default) |
| 1272 | 2 | tests/unit/specs/composables/usePaths.spec.js > usePath > normalizeDirectory > ensures a single trailing "/" and removes duplicates |
| 1273 | 2 | tests/unit/specs/composables/usePaths.spec.js > usePath > isSelectedPath > matches regardless of trailing slash (POSIX) |
| 1274 | 2 | tests/unit/specs/composables/usePaths.spec.js > usePath > getBasename > returns last segment for POSIX paths |
| 1275 | 2 | tests/unit/specs/composables/usePaths.spec.js > usePath > exposes default path separator from config ("/") |
| 1276 | 2 | tests/unit/specs/composables/useOnce.spec.js > useOnce > reset() clears cached success and allows rerun |
| 1277 | 2 | tests/unit/specs/composables/useOnce.spec.js > useOnce > concurrent callers share the same in-flight promise |
| 1278 | 2 | tests/unit/specs/composables/useOnce.spec.js > useOnce > after a failed first run, next call can change the captured args |
| 1279 | 2 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > real-world usage patterns > should work with properties array serialization |
| 1280 | 2 | tests/unit/specs/composables/useElementObserver.spec.js > useElementObserver > resolves when element is removed (destroyed) |
| 1281 | 2 | tests/unit/specs/composables/useDocumentEntryMemo.spec.js > useDocumentEntryMemo > integration scenarios > should detect changes correctly for v-memo comparison |
| 1282 | 2 | tests/unit/specs/composables/useDocumentEntryMemo.spec.js > useDocumentEntryMemo > getMemoKey > should include all registered dependencies |
| 1283 | 2 | tests/unit/specs/composables/useDocumentEntryMemo.spec.js > useDocumentEntryMemo > addProperties > should react to properties changes |
| 1284 | 2 | tests/unit/specs/composables/useDocumentEntryMemo.spec.js > useDocumentEntryMemo > addProperties > should accept a ref directly |
| 1285 | 2 | tests/unit/specs/composables/useDataDir.spec.js > useDataDir > mountedDataDir > should return the mounted data directory |
| 1286 | 2 | tests/unit/specs/composables/awaitWhenever.spec.js > awaitWhenever > using Vue refs > awaits when ref.value is true |
| 1287 | 2 | tests/unit/specs/components/Widget/WidgetNested.spec.js > WidgetNested.vue > show ordered widgets |
| 1288 | 2 | tests/unit/specs/components/Display/DisplayEmpty.spec.js > DisplayEmpty > when value is empty string > should display dash |
| 1289 | 2 | tests/unit/specs/components/Display/DisplayEmpty.spec.js > DisplayEmpty > value types > should handle zero as a valid value |
| 1290 | 2 | tests/unit/specs/components/Display/DisplayEmpty.spec.js > DisplayEmpty > value types > should handle boolean false as empty |
| 1291 | 2 | tests/unit/specs/api/resources/Document.spec.js > Document > should generate the title according to document type > should return the first 10 characters of the id, for default document without any path |
| 1292 | 2 | tests/unit/specs/api/resources/Document.spec.js > Document > should generate the title according to document type > should return the dc_title if it is an email that has no subject |
| 1293 | 2 | tests/unit/specs/api/resources/Document.spec.js > Document > should generate the document parent url |
| 1294 | 2 | tests/unit/specs/api/resources/Auth.spec.js > auth backend client > reset > should clear the session cookie |
| 1295 | 2 | tests/unit/specs/api/resources/Auth.spec.js > auth backend client > reset > should clear the cached username |
| 1296 | 2 | tests/unit/specs/api/resources/Auth.spec.js > auth backend client > getUsername > should throw error when testing basic auth and response is other than 200 or 401 |
| 1297 | 2 | tests/unit/specs/api/resources/Auth.spec.js > auth backend client > getAuthenticatedUser > should return user login if user is authenticated |
| 1298 | 2 | tests/unit/specs/api/resources/Auth.spec.js > auth backend client > getAuthenticatedUser > should return null if cookie has no "login" field |
| 1299 | 2 | tests/unit/specs/api/index.spec.js > Datashare backend client > should send a put JSON for addHistoryEvent |
| 1300 | 2 | tests/unit/specs/api/index.spec.js > Datashare backend client > should send a post JSON for relaunchBatchSearch |
| 1301 | 2 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to tagDocument |
| 1302 | 2 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to findNames |
| 1303 | 2 | tests/unit/specs/api/index.spec.js > Datashare backend client > should emit an error if the backend response has a bad status |
| 1304 | 2 | tests/unit/specs/api/index.spec.js > Datashare backend client > should call trim "/" from path when calling indexPath with "/file/" |
| 1305 | 2 | tests/unit/specs/api/index.spec.js > Datashare backend client > project policies > should call getProjectPolicies with domain and project |
| 1306 | 2 | tests/unit/specs/api/apiInstance.spec.js > apiInstance > csrf > should configure axios xsrfCookieName from settings |
| 1307 | 1 | tests/unit/specs/utils/utils.spec.js > utils > objectIncludes > should filter on a simple string, not case sensitive |
| 1308 | 1 | tests/unit/specs/utils/utils.spec.js > utils > objectIncludes > should filter on a simple object of strings |
| 1309 | 1 | tests/unit/specs/utils/utils.spec.js > utils > objectIncludes > should filter on an array of strings |
| 1310 | 1 | tests/unit/specs/utils/utils.spec.js > utils > objectIncludes > should filter on a complex object of strings |
| 1311 | 1 | tests/unit/specs/utils/utils.spec.js > utils > getShortkeyOS > should return "mac" if mac OS |
| 1312 | 1 | tests/unit/specs/utils/utils.spec.js > utils > getShortkeyOS > should return "default" if other than mac OS |
| 1313 | 1 | tests/unit/specs/utils/utils.spec.js > utils > getOS > should retrieve Windows OS |
| 1314 | 1 | tests/unit/specs/utils/utils.spec.js > utils > getOS > should retrieve no OS |
| 1315 | 1 | tests/unit/specs/utils/utils.spec.js > utils > getOS > should retrieve Linux OS |
| 1316 | 1 | tests/unit/specs/utils/utils.spec.js > utils > getExtractionLevelTranslationKey > should retrieve the extraction level if no level (2/2) |
| 1317 | 1 | tests/unit/specs/utils/utils.spec.js > utils > getExtractionLevelTranslationKey > should retrieve the extraction level if no level (1/2) |
| 1318 | 1 | tests/unit/specs/utils/utils.spec.js > utils > getExtractionLevelTranslationKey > should retrieve the extraction level for unknown level |
| 1319 | 1 | tests/unit/specs/utils/utils.spec.js > utils > getExtractionLevelTranslationKey > should retrieve the correct extraction level translation key |
| 1320 | 1 | tests/unit/specs/utils/utils.spec.js > utils > getDocumentTypeLabel > should retrieve the document type if no type (2/2) |
| 1321 | 1 | tests/unit/specs/utils/utils.spec.js > utils > getDocumentTypeLabel > should retrieve the document type if no type (1/2) |
| 1322 | 1 | tests/unit/specs/utils/utils.spec.js > utils > getDocumentTypeLabel > should retrieve the document type for unknown type |
| 1323 | 1 | tests/unit/specs/utils/utils.spec.js > utils > getDocumentTypeLabel > should retrieve the document type for PDF |
| 1324 | 1 | tests/unit/specs/utils/strings.spec.js > strings > isUrl > should return true if it is an url |
| 1325 | 1 | tests/unit/specs/utils/strings.spec.js > strings > getConsonants > get 0 consonants from `oui` string |
| 1326 | 1 | tests/unit/specs/utils/strings.spec.js > strings > addLocalSearchMarksClass > should wrap regex |
| 1327 | 1 | tests/unit/specs/utils/strings.spec.js > strings > addLocalSearchMarksClass > should wrap "Lorem" with tags in string without HTML |
| 1328 | 1 | tests/unit/specs/utils/strings.spec.js > strings > addLocalSearchMarksClass > should wrap "Lorem" in a deeply nested string |
| 1329 | 1 | tests/unit/specs/utils/strings.spec.js > strings > addLocalSearchMarksClass > should wrap "ipsum" with tags in string with HTML, wrapped with a span |
| 1330 | 1 | tests/unit/specs/utils/strings.spec.js > strings > addLocalSearchMarksClass > should wrap "ipsum" with tags in string with HTML |
| 1331 | 1 | tests/unit/specs/utils/strings.spec.js > strings > addLocalSearchMarksClass > should wrap "dolor" with tags string without HTML even with a toekn in uppercase |
| 1332 | 1 | tests/unit/specs/utils/strings.spec.js > strings > addLocalSearchMarksClass > should wrap "DOLOR" with tags in uppercase string without HTML |
| 1333 | 1 | tests/unit/specs/utils/strings.spec.js > strings > addLocalSearchMarksClass > should wrap "DOLOR" (uppercase) with tags in string without HTML |
| 1334 | 1 | tests/unit/specs/utils/strings.spec.js > strings > addLocalSearchMarksClass > shouldn't wrap "Lorem ipsum" in different tags |
| 1335 | 1 | tests/unit/specs/utils/strings.spec.js > strings > addLocalSearchMarksClassByOffsets > should replace "ipsum" using its offset |
| 1336 | 1 | tests/unit/specs/utils/humanSize.spec.js > humanSize filter > should return "—" if size is an empty string |
| 1337 | 1 | tests/unit/specs/utils/humanSize.spec.js > humanSize filter > should display human readable size for 0 |
| 1338 | 1 | tests/unit/specs/utils/highlight.spec.js > Highlight > should not hightlight |
| 1339 | 1 | tests/unit/specs/utils/highlight.spec.js > Highlight > should hightlight only "ba" to avoid overlap |
| 1340 | 1 | tests/unit/specs/utils/highlight.spec.js > Highlight > should hightlight only "bar" to avoid overlap |
| 1341 | 1 | tests/unit/specs/utils/highlight.spec.js > Highlight > should hightlight one "baz" |
| 1342 | 1 | tests/unit/specs/utils/highlight.spec.js > Highlight > should hightlight one "bar" with a custom class |
| 1343 | 1 | tests/unit/specs/utils/highlight.spec.js > Highlight > should hightlight one "bar" |
| 1344 | 1 | tests/unit/specs/utils/highlight.spec.js > Highlight > should hightlight "foo", "bar" and "baz" |
| 1345 | 1 | tests/unit/specs/utils/highlight.spec.js > Highlight > should hightlight "foo" and "bar" with a category class |
| 1346 | 1 | tests/unit/specs/utils/highlight.spec.js > Highlight > should hightlight "foo" and "bar" |
| 1347 | 1 | tests/unit/specs/utils/esSnapshots.spec.js > esSnapshots utils > parseSnapshotName > should parse snapshot name with version only and default to elasticsearch |
| 1348 | 1 | tests/unit/specs/utils/esSnapshots.spec.js > esSnapshots utils > parseSnapshotName > should parse snapshot name without version or distribution and default to elasticsearch |
| 1349 | 1 | tests/unit/specs/utils/esSnapshots.spec.js > esSnapshots utils > parseSnapshotName > should handle null input |
| 1350 | 1 | tests/unit/specs/utils/esSnapshots.spec.js > esSnapshots utils > parseSnapshotName > should handle empty string |
| 1351 | 1 | tests/unit/specs/utils/esSnapshots.spec.js > esSnapshots utils > formatSnapshotName > should include version when provided |
| 1352 | 1 | tests/unit/specs/utils/esSnapshots.spec.js > esSnapshots utils > formatSnapshotName > should include only distribution when version is null |
| 1353 | 1 | tests/unit/specs/utils/esSnapshots.spec.js > esSnapshots utils > formatSnapshotName > should include distribution and version when both provided |
| 1354 | 1 | tests/unit/specs/utils/diff.spec.js > diff > handles array differences correctly |
| 1355 | 1 | tests/unit/specs/store/modules/wait.spec.js > WaitStore > should work with ref inputs for scope and id |
| 1356 | 1 | tests/unit/specs/store/modules/wait.spec.js > WaitStore > should update a loader value |
| 1357 | 1 | tests/unit/specs/store/modules/wait.spec.js > WaitStore > should set and get a loader value for a specific scope |
| 1358 | 1 | tests/unit/specs/store/modules/wait.spec.js > WaitStore > should return undefined for a non-existing loader |
| 1359 | 1 | tests/unit/specs/store/modules/task.spec.js > TaskStore > should indicate task 57 as running |
| 1360 | 1 | tests/unit/specs/store/modules/task.spec.js > TaskStore > should indicate task 57 as not over |
| 1361 | 1 | tests/unit/specs/store/modules/task.spec.js > TaskStore > should indicate task 46 as queued |
| 1362 | 1 | tests/unit/specs/store/modules/task.spec.js > TaskStore > should indicate task 46 as not over |
| 1363 | 1 | tests/unit/specs/store/modules/task.spec.js > TaskStore > should indicate task 12 as over |
| 1364 | 1 | tests/unit/specs/store/modules/pipelines.spec.js > PipelinesStore > should register a pipeline with no name |
| 1365 | 1 | tests/unit/specs/store/modules/pipelines.spec.js > PipelinesStore > should register a pipeline with a function to uppercase |
| 1366 | 1 | tests/unit/specs/store/modules/pipelines.spec.js > PipelinesStore > should register a pipeline with a function |
| 1367 | 1 | tests/unit/specs/store/modules/pipelines.spec.js > PipelinesStore > should register a pipeline using the type `IdentityPipeline` by default |
| 1368 | 1 | tests/unit/specs/store/modules/pipelines.spec.js > PipelinesStore > should register 3 pipelines with the category `test-category-bar` |
| 1369 | 1 | tests/unit/specs/store/modules/pipelines.spec.js > PipelinesStore > should have ordered pipelines with a property |
| 1370 | 1 | tests/unit/specs/store/modules/insights.spec.js > InsightsStore > should instantiate a widget of type WidgetText |
| 1371 | 1 | tests/unit/specs/store/modules/documentPathBanners.spec.js > DocumentPathBannersStore > should call the API endpoint only once even with concurrent calls |
| 1372 | 1 | tests/unit/specs/store/modules/app.spec.js > AppStore > unpinProject should not affect the array if the project is not pinned |
| 1373 | 1 | tests/unit/specs/store/modules/app.spec.js > AppStore > should set settings using a string and value |
| 1374 | 1 | tests/unit/specs/store/modules/app.spec.js > AppStore > should reset settings for projectList View view only |
| 1375 | 1 | tests/unit/specs/store/modules/app.spec.js > AppStore > should reset settings for array settings |
| 1376 | 1 | tests/unit/specs/store/modules/app.spec.js > AppStore > should reset search operator to OR after change |
| 1377 | 1 | tests/unit/specs/store/modules/app.spec.js > AppStore > should default search operator to OR |
| 1378 | 1 | tests/unit/specs/store/modules/app.spec.js > AppStore > pinProject should not add a duplicate project to the pins array |
| 1379 | 1 | tests/unit/specs/store/modules/app.spec.js > AppStore > isProjectPinned should return true if the project is pinned |
| 1380 | 1 | tests/unit/specs/store/modules/app.spec.js > AppStore > isProjectPinned should return false if the project is not pinned |
| 1381 | 1 | tests/unit/specs/store/hooks/HookedComponent.spec.js > HookedComponent > should instance a HookedComponent class |
| 1382 | 1 | tests/unit/specs/store/hooks/HookedComponent.spec.js > HookedComponent > should have a default order attribute |
| 1383 | 1 | tests/unit/specs/store/hooks/HookedComponent.spec.js > HookedComponent > should have a default definition attribute |
| 1384 | 1 | tests/unit/specs/store/hooks/HookedComponent.spec.js > HookedComponent > should get a component definition  from a string |
| 1385 | 1 | tests/unit/specs/store/hooks/HookedComponent.spec.js > HookedComponent > should get a component definition |
| 1386 | 1 | tests/unit/specs/store/filters/index.spec.js > filters index > pageless opt-ins > configures language with pagelessBucketSize 1000 |
| 1387 | 1 | tests/unit/specs/store/filters/FilterText.spec.js > FilterText.js > pagelessBucketSize > stores the provided numeric value |
| 1388 | 1 | tests/unit/specs/store/filters/FilterPath.spec.js > FilterPath.js > should NOT add slash to path in json if path already have one |
| 1389 | 1 | tests/unit/specs/store/filters/FilterEntity.spec.js > FilterEntity.js > should filter on non existing category |
| 1390 | 1 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should return the same store when `withSuffix` has no params |
| 1391 | 1 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should create a store with a suffix factory that can be used with `mapState` |
| 1392 | 1 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should create a store with a default id |
| 1393 | 1 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should create a store that is persisted in pinia registry |
| 1394 | 1 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should create a store factory with a suffix that can be used with `mapStores` |
| 1395 | 1 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should create a store factory that can be used with `mapStores` |
| 1396 | 1 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should create a store factory that can be used with `mapState` |
| 1397 | 1 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should camelCase the suffixed store id |
| 1398 | 1 | tests/unit/specs/store/defineSuffixedStore.spec.js > store/defineSuffixedStore > should camelCase the store id |
| 1399 | 1 | tests/unit/specs/core/WidgetsMixin.spec.js > WidgetsMixin > should register a widget with a custom type with a function |
| 1400 | 1 | tests/unit/specs/core/WidgetsMixin.spec.js > WidgetsMixin > should register a widget with a custom type with a class |
| 1401 | 1 | tests/unit/specs/core/Core.spec.js > Core > should not expose the VueI18n if it is not installed |
| 1402 | 1 | tests/unit/specs/core/Core.spec.js > Core > should not expose the router if it is not installed |
| 1403 | 1 | tests/unit/specs/composables/useSelection.spec.js > useSelection > should toggle selection correctly |
| 1404 | 1 | tests/unit/specs/composables/useSelection.spec.js > useSelection > should select all values when setting indeterminate to true |
| 1405 | 1 | tests/unit/specs/composables/useSelection.spec.js > useSelection > should select all values using selectAll function |
| 1406 | 1 | tests/unit/specs/composables/useSelection.spec.js > useSelection > should remove value from selection |
| 1407 | 1 | tests/unit/specs/composables/useSelection.spec.js > useSelection > should not add duplicate values to selection |
| 1408 | 1 | tests/unit/specs/composables/useSelection.spec.js > useSelection > should mark indeterminate state correctly |
| 1409 | 1 | tests/unit/specs/composables/useSelection.spec.js > useSelection > should initialize with a given selection |
| 1410 | 1 | tests/unit/specs/composables/useSelection.spec.js > useSelection > should correctly identify if a value is selection |
| 1411 | 1 | tests/unit/specs/composables/useSelection.spec.js > useSelection > should correctly get and set selectionValues via proxy |
| 1412 | 1 | tests/unit/specs/composables/usePaths.spec.js > usePath > unselectPath > removes an existing normalized path |
| 1413 | 1 | tests/unit/specs/composables/usePaths.spec.js > usePath > unselectPath > does nothing when path is not selected (documented expected behavior) |
| 1414 | 1 | tests/unit/specs/composables/usePaths.spec.js > usePath > togglePath > works with multiple=true |
| 1415 | 1 | tests/unit/specs/composables/usePaths.spec.js > usePath > togglePath > selects when not selected, unselects when selected (single mode) |
| 1416 | 1 | tests/unit/specs/composables/usePaths.spec.js > usePath > supports custom path separator from config (e.g., "\\") |
| 1417 | 1 | tests/unit/specs/composables/usePaths.spec.js > usePath > selectPath > appends when multiple=true |
| 1418 | 1 | tests/unit/specs/composables/usePaths.spec.js > usePath > selectPath > allows duplicates when multiple=true (current behavior) |
| 1419 | 1 | tests/unit/specs/composables/usePaths.spec.js > usePath > normalizeDirectory > ensures a single trailing "\" on Windows paths |
| 1420 | 1 | tests/unit/specs/composables/usePaths.spec.js > usePath > isSelectedPath > works with Windows separator |
| 1421 | 1 | tests/unit/specs/composables/usePaths.spec.js > usePath > isIndeterminateDirectory > is true when some (but not all) children are selected and dir is not selected |
| 1422 | 1 | tests/unit/specs/composables/usePaths.spec.js > usePath > getBasename > returns last segment for Windows-style paths |
| 1423 | 1 | tests/unit/specs/composables/usePaths.spec.js > usePath > getAncestorPaths > works with Windows-style paths |
| 1424 | 1 | tests/unit/specs/composables/usePaths.spec.js > usePath > getAncestorPaths > returns all intermediate paths between base and target |
| 1425 | 1 | tests/unit/specs/composables/usePaths.spec.js > usePath > getAncestorPaths > handles trailing separators on target path |
| 1426 | 1 | tests/unit/specs/composables/useOnce.spec.js > useOnce > captures arguments from the first invocation only |
| 1427 | 1 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > remove > should remove an existing dependency |
| 1428 | 1 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > real-world usage patterns > should work with boolean flags |
| 1429 | 1 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > real-world usage patterns > should support creating specialized builders |
| 1430 | 1 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > real-world usage patterns > should handle multiple items with same static deps |
| 1431 | 1 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > has > should return false for non-existing dependency |
| 1432 | 1 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > get > should return undefined for non-existing dependency |
| 1433 | 1 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > getAll > should return empty array when no dependencies |
| 1434 | 1 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > getAll > should reflect changes in reactive dependencies |
| 1435 | 1 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > build > should return only static keys when no dynamic values |
| 1436 | 1 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > build > should handle complex dynamic values |
| 1437 | 1 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > build > should combine dynamic object values with static keys |
| 1438 | 1 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > add > should register a static dependency with a ref |
| 1439 | 1 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > add > should handle reactive ref updates |
| 1440 | 1 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > add > should handle reactive getter updates |
| 1441 | 1 | tests/unit/specs/composables/useDocumentEntryMemo.spec.js > useDocumentEntryMemo > integration scenarios > should work without any dependencies added |
| 1442 | 1 | tests/unit/specs/composables/useDocumentEntryMemo.spec.js > useDocumentEntryMemo > integration scenarios > should work with array of entries |
| 1443 | 1 | tests/unit/specs/composables/useDocumentEntryMemo.spec.js > useDocumentEntryMemo > getMemoKey > should return entry id, selection state, and active state |
| 1444 | 1 | tests/unit/specs/composables/useDocumentEntryMemo.spec.js > useDocumentEntryMemo > add > should allow adding with getter function |
| 1445 | 1 | tests/unit/specs/composables/useDocumentEntryMemo.spec.js > useDocumentEntryMemo > add > should allow adding custom dependencies |
| 1446 | 1 | tests/unit/specs/composables/useDocumentEntryMemo.spec.js > useDocumentEntryMemo > addSelectMode > should react to select mode changes |
| 1447 | 1 | tests/unit/specs/composables/useDocumentEntryMemo.spec.js > useDocumentEntryMemo > addSelectMode > should add select mode as a memo dependency |
| 1448 | 1 | tests/unit/specs/composables/useDocumentEntryMemo.spec.js > useDocumentEntryMemo > addSelectMode > should accept a ref directly |
| 1449 | 1 | tests/unit/specs/composables/useDataDir.spec.js > useDataDir > getMountedPath > should return the original path when it does not start with dataDir |
| 1450 | 1 | tests/unit/specs/composables/useDataDir.spec.js > useDataDir > getMountedPath > should replace dataDir with mountedDataDir when path starts with dataDir |
| 1451 | 1 | tests/unit/specs/composables/useDataDir.spec.js > useDataDir > getMountedPath > should only replace the first occurrence of dataDir |
| 1452 | 1 | tests/unit/specs/composables/useDataDir.spec.js > useDataDir > getMountedPath > should handle paths with trailing slashes |
| 1453 | 1 | tests/unit/specs/composables/useDataDir.spec.js > useDataDir > getMountedPath > should handle paths with special characters |
| 1454 | 1 | tests/unit/specs/composables/useDataDir.spec.js > useDataDir > getMountedPath > should handle paths that are exactly equal to dataDir |
| 1455 | 1 | tests/unit/specs/composables/useDataDir.spec.js > useDataDir > getMountedPath > should handle empty paths |
| 1456 | 1 | tests/unit/specs/composables/awaitWhenever.spec.js > awaitWhenever > using Vue refs > does NOT await when ref.value is false |
| 1457 | 1 | tests/unit/specs/composables/awaitWhenever.spec.js > awaitWhenever > synchronous fn > works with literal booleans: true |
| 1458 | 1 | tests/unit/specs/composables/awaitWhenever.spec.js > awaitWhenever > synchronous fn > works with literal booleans: false |
| 1459 | 1 | tests/unit/specs/composables/awaitWhenever.spec.js > awaitWhenever > synchronous fn > awaits and calls fn when condition fn returns true |
| 1460 | 1 | tests/unit/specs/composables/awaitWhenever.spec.js > awaitWhenever > edge-case truthy/falsy values via toValue > treats ref(1) as truthy and awaits |
| 1461 | 1 | tests/unit/specs/composables/awaitWhenever.spec.js > awaitWhenever > edge-case truthy/falsy values via toValue > treats ref(0) as falsy and does NOT await |
| 1462 | 1 | tests/unit/specs/composables/awaitWhenever.spec.js > awaitWhenever > async fn + manual promise > does NOT await async fn when condition function is falsy |
| 1463 | 1 | tests/unit/specs/composables/awaitWhenever.spec.js > awaitWhenever > async fn + manual promise > awaits async fn when condition function is truthy |
| 1464 | 1 | tests/unit/specs/api/resources/Document.spec.js > Document > should return the correct basename on Windows |
| 1465 | 1 | tests/unit/specs/api/resources/Document.spec.js > Document > should return "—" if no document size |
| 1466 | 1 | tests/unit/specs/api/resources/Document.spec.js > Document > should generate the title according to document type > should return the subject (old mapping) if it is an email |
| 1467 | 1 | tests/unit/specs/api/resources/Document.spec.js > Document > should generate the title according to document type > should return the subject if it is an email |
| 1468 | 1 | tests/unit/specs/api/resources/Document.spec.js > Document > should generate the title according to document type > should return the resourceName if extractionLevel is superior to 0 |
| 1469 | 1 | tests/unit/specs/api/resources/Document.spec.js > Document > should generate the title according to document type > should return the file name of the path if any, for default document |
| 1470 | 1 | tests/unit/specs/api/resources/Document.spec.js > Document > should generate the title according to document type > should return the dc_title if it is a tweet |
| 1471 | 1 | tests/unit/specs/api/resources/Document.spec.js > Document > should generate the title according to document type > should return "extracted" resourceName if extractionLevel > 0 and resourceName starts with "=?" and ends with "?=" |
| 1472 | 1 | tests/unit/specs/api/resources/Document.spec.js > Document > retrieve metadata as query parameter |
| 1473 | 1 | tests/unit/specs/api/resources/Document.spec.js > Document > check if document is of video type > should NOT be an video file |
| 1474 | 1 | tests/unit/specs/api/resources/Document.spec.js > Document > check if document is of JSON type > should NOT be a JSON file |
| 1475 | 1 | tests/unit/specs/api/resources/Document.spec.js > Document > check if document is of JSON type > should be a JSON file |
| 1476 | 1 | tests/unit/specs/api/resources/Document.spec.js > Document > check if document is of audio type > should NOT be an audio file |
| 1477 | 1 | tests/unit/specs/api/resources/Document.spec.js > Document > check if document is of audio type > should be an audio file |
| 1478 | 1 | tests/unit/specs/api/resources/Document.spec.js > Document > check if a document is a tweet > should be a tweet |
| 1479 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to untagDocument |
| 1480 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to unstarDocument |
| 1481 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to uninstallPluginFromId |
| 1482 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to uninstallExtensionFromId |
| 1483 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to stopTask |
| 1484 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to stopPendingTasks |
| 1485 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to starDocument |
| 1486 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to setUnmarkAsRecommended |
| 1487 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to setSettings |
| 1488 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to setMarkAsRecommended |
| 1489 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to removeProjects |
| 1490 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to removeNamedEntitiesByMentionNorm |
| 1491 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to removeDoneTasks |
| 1492 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to removeBatchSearches |
| 1493 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to removeApiKey |
| 1494 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to installPluginFromUrl |
| 1495 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to installPluginFromId |
| 1496 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to installExtensionFromUrl |
| 1497 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to installExtensionFromId |
| 1498 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to getVersion |
| 1499 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to getTasks |
| 1500 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to getStarredDocuments |
| 1501 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to getSource |
| 1502 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to getSettings |
| 1503 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to getRecommendationsByDocuments |
| 1504 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to getPlugins |
| 1505 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to getNerPipelines |
| 1506 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to getHistoryEvents |
| 1507 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to getExtensions |
| 1508 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to getDocumentsRecommendedBy |
| 1509 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to getBatchSearchResults |
| 1510 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to getBatchSearch |
| 1511 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to fetchIndicesRecommendations |
| 1512 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to createIndex |
| 1513 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return backend response to createApiKey |
| 1514 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return a backend response to updateProject |
| 1515 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return a backend response to removeProject |
| 1516 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return a backend response to removeHistoryEvents |
| 1517 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return a backend response to removeHistoryEvent |
| 1518 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return a backend response to mappings |
| 1519 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should return a backend response to createProject |
| 1520 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > should call getUserPermissions |
| 1521 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > project policies > should pass user filter to getProjectPolicies |
| 1522 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > project policies > should pass pagination params to getProjectPolicies |
| 1523 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > project policies > should call saveProjectPolicy with domain, project, user and role |
| 1524 | 1 | tests/unit/specs/api/index.spec.js > Datashare backend client > project policies > should call removeProjectPolicy with domain, project, user and role |
| 1525 | 1 | tests/unit/composables/usePolicies.spec.js > usePolicies > isProjectAdmin returns true for admin project |
| 1526 | 1 | tests/unit/composables/usePolicies.spec.js > usePolicies > isProjectAdmin returns false for non-admin project |
| 1527 | 1 | tests/unit/composables/usePolicies.spec.js > usePolicies > getRoleByProject returns default role for unknown project |
| 1528 | 1 | tests/unit/composables/usePolicies.spec.js > usePolicies > getHighestRoleFromListForDomain > returns default role when no policy matches the domain |
| 1529 | 1 | tests/unit/composables/usePolicies.spec.js > usePolicies > check role hierarchy with bit to see if a role has at least PROJECT_EDITOR capability |
| 1530 | 0 | tests/unit/specs/utils/strings.spec.js > strings > isUrl > should return true if it is an sftp url as requested |
| 1531 | 0 | tests/unit/specs/utils/strings.spec.js > strings > isUrl > should return false if it is NOT an url |
| 1532 | 0 | tests/unit/specs/utils/strings.spec.js > strings > isUrl > should return false if it is an sftp url |
| 1533 | 0 | tests/unit/specs/utils/strings.spec.js > strings > getConsonants > get 3 consonants from `LOCAL` string while keeping the case |
| 1534 | 0 | tests/unit/specs/utils/strings.spec.js > strings > getConsonants > get 3 consonants from `local` string |
| 1535 | 0 | tests/unit/specs/utils/strings.spec.js > strings > addLocalSearchMarksClass > should wrap "dolor" with tags in string with HTML |
| 1536 | 0 | tests/unit/specs/utils/strings.spec.js > strings > addLocalSearchMarksClass > should wrap "dolor" in a deeply nested string |
| 1537 | 0 | tests/unit/specs/utils/strings.spec.js > strings > addLocalSearchMarksClass > should preserve HTML tags |
| 1538 | 0 | tests/unit/specs/utils/strings.spec.js > strings > addLocalSearchMarksClass > should display HTML characters |
| 1539 | 0 | tests/unit/specs/utils/strings.spec.js > strings > addLocalSearchMarksClassByOffsets > should replace "lorem" using its offset |
| 1540 | 0 | tests/unit/specs/utils/strings.spec.js > strings > addLocalSearchMarksClassByOffsets > should replace "i" using theirs offsets |
| 1541 | 0 | tests/unit/specs/utils/strings.spec.js > strings > addLocalSearchMarksClassByOffsets > should replace "dolor" using its offset minus the given delta |
| 1542 | 0 | tests/unit/specs/utils/humanSize.spec.js > humanSize filter > should strip trailing zeros for a round Gigabyte value |
| 1543 | 0 | tests/unit/specs/utils/humanSize.spec.js > humanSize filter > should strip only the trailing zero for a value with one significant decimal |
| 1544 | 0 | tests/unit/specs/utils/humanSize.spec.js > humanSize filter > should return "—" if size is undefined |
| 1545 | 0 | tests/unit/specs/utils/humanSize.spec.js > humanSize filter > should display human readable size for Megabytes WITHOUT bytes |
| 1546 | 0 | tests/unit/specs/utils/humanSize.spec.js > humanSize filter > should display human readable size for Megabytes WITH bytes |
| 1547 | 0 | tests/unit/specs/utils/humanSize.spec.js > humanSize filter > should display human readable size for Kilobytes WITHOUT bytes |
| 1548 | 0 | tests/unit/specs/utils/humanSize.spec.js > humanSize filter > should display human readable size for Kilobytes WITH bytes |
| 1549 | 0 | tests/unit/specs/utils/humanSize.spec.js > humanSize filter > should display human readable size for Bytes |
| 1550 | 0 | tests/unit/specs/utils/findPath.spec.js > findPath > should return the correct path for a nested key-value pair |
| 1551 | 0 | tests/unit/specs/utils/findPath.spec.js > findPath > should return null if the value is not found |
| 1552 | 0 | tests/unit/specs/utils/findPath.spec.js > findPath > should handle empty objects gracefully |
| 1553 | 0 | tests/unit/specs/utils/findPath.spec.js > findPath > should handle deeply nested structures |
| 1554 | 0 | tests/unit/specs/utils/esSnapshots.spec.js > esSnapshots utils > parseSnapshotName > should parse snapshot name with distribution only |
| 1555 | 0 | tests/unit/specs/utils/esSnapshots.spec.js > esSnapshots utils > parseSnapshotName > should handle complex version numbers |
| 1556 | 0 | tests/unit/specs/utils/diff.spec.js > diff > returns empty differences for identical objects |
| 1557 | 0 | tests/unit/specs/utils/diff.spec.js > diff > handles objects with no overlapping keys |
| 1558 | 0 | tests/unit/specs/utils/diff.spec.js > diff > handles nested objects with additions and deletions |
| 1559 | 0 | tests/unit/specs/utils/diff.spec.js > diff > handles key with one additional value |
| 1560 | 0 | tests/unit/specs/utils/diff.spec.js > diff > handles additions of values to existing keys as additions |
| 1561 | 0 | tests/unit/specs/store/modules/wait.spec.js > WaitStore > should default to global scope when scopeKeyRef is undefined |
| 1562 | 0 | tests/unit/specs/store/modules/player.spec.js > PlayerStore > should set loop to true by default |
| 1563 | 0 | tests/unit/specs/store/filters/index.spec.js > filters index > pageless opt-ins > configures extractionLevel with pagelessBucketSize 10 |
| 1564 | 0 | tests/unit/specs/store/filters/index.spec.js > filters index > pageless opt-ins > configures contentType with pagelessBucketSize 1000 |
| 1565 | 0 | tests/unit/specs/store/filters/index.spec.js > filters index > other filters stay paginated > tags has no pagelessBucketSize |
| 1566 | 0 | tests/unit/specs/store/filters/index.spec.js > filters index > other filters stay paginated > path has no pagelessBucketSize |
| 1567 | 0 | tests/unit/specs/store/filters/index.spec.js > filters index > other filters stay paginated > namedEntityPerson has no pagelessBucketSize |
| 1568 | 0 | tests/unit/specs/store/filters/index.spec.js > filters index > other filters stay paginated > namedEntityOrganization has no pagelessBucketSize |
| 1569 | 0 | tests/unit/specs/store/filters/index.spec.js > filters index > other filters stay paginated > namedEntityLocation has no pagelessBucketSize |
| 1570 | 0 | tests/unit/specs/store/filters/index.spec.js > filters index > other filters stay paginated > namedEntityEmail has no pagelessBucketSize |
| 1571 | 0 | tests/unit/specs/composables/useSelection.spec.js > useSelection > should unselect all values using unselectAll function |
| 1572 | 0 | tests/unit/specs/composables/useSelection.spec.js > useSelection > should not remove value that is not in selection |
| 1573 | 0 | tests/unit/specs/composables/usePaths.spec.js > usePath > isIndeterminateDirectory > is true for deeper nesting when parent not selected |
| 1574 | 0 | tests/unit/specs/composables/usePaths.spec.js > usePath > isIndeterminateDirectory > is false when no children are selected |
| 1575 | 0 | tests/unit/specs/composables/usePaths.spec.js > usePath > isIndeterminateDirectory > is false when directory itself is selected (even if children are too) |
| 1576 | 0 | tests/unit/specs/composables/usePaths.spec.js > usePath > getAncestorPaths > returns empty array when target equals base |
| 1577 | 0 | tests/unit/specs/composables/usePaths.spec.js > usePath > getAncestorPaths > returns empty array when target does not start with base |
| 1578 | 0 | tests/unit/specs/composables/usePaths.spec.js > usePath > getAncestorPaths > handles trailing separators on base path |
| 1579 | 0 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > remove > should return false when removing non-existing dependency |
| 1580 | 0 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > has > should return true for existing dependency |
| 1581 | 0 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > get > should return the computed value |
| 1582 | 0 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > build > should preserve order: dynamic first, then static |
| 1583 | 0 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > build > should handle empty dynamic values |
| 1584 | 0 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > build > should combine dynamic array values with static keys |
| 1585 | 0 | tests/unit/specs/composables/useMemoKey.spec.js > useMemoKey > add > should overwrite existing dependency with same name |
| 1586 | 0 | tests/unit/specs/composables/useDocumentEntryMemo.spec.js > useDocumentEntryMemo > getMemoKey > should default active state to false |
| 1587 | 0 | tests/unit/specs/api/resources/Document.spec.js > Document > check if document is of video type > should be an video file |
| 1588 | 0 | tests/unit/specs/api/resources/Document.spec.js > Document > check if a document is a tweet > should NOT be a tweet |
| 1589 | 0 | tests/unit/specs/api/apiInstance.spec.js > apiInstance > csrf > should configure axios xsrfHeaderName from settings |
| 1590 | 0 | tests/unit/composables/usePolicies.spec.js > usePolicies > getHighestRoleFromList > returns the single role when list has one entry |
| 1591 | 0 | tests/unit/composables/usePolicies.spec.js > usePolicies > getHighestRoleFromList > returns the highest role from multiple policies |
| 1592 | 0 | tests/unit/composables/usePolicies.spec.js > usePolicies > getHighestRoleFromList > returns INSTANCE_ADMIN as highest when present |
| 1593 | 0 | tests/unit/composables/usePolicies.spec.js > usePolicies > getHighestRoleFromList > returns default role when all roles are unknown |
| 1594 | 0 | tests/unit/composables/usePolicies.spec.js > usePolicies > getHighestRoleFromList > returns default role for empty list |
| 1595 | 0 | tests/unit/composables/usePolicies.spec.js > usePolicies > getHighestRoleFromListForProject > returns the role for the exact domain + project |
| 1596 | 0 | tests/unit/composables/usePolicies.spec.js > usePolicies > getHighestRoleFromListForProject > returns default role when no policy matches |
| 1597 | 0 | tests/unit/composables/usePolicies.spec.js > usePolicies > getHighestRoleFromListForProject > includes policies with wildcard projectId |
| 1598 | 0 | tests/unit/composables/usePolicies.spec.js > usePolicies > getHighestRoleFromListForProject > includes policies with wildcard domainId |
| 1599 | 0 | tests/unit/composables/usePolicies.spec.js > usePolicies > getHighestRoleFromListForProject > excludes policies from a different domain even with wildcard project |
| 1600 | 0 | tests/unit/composables/usePolicies.spec.js > usePolicies > getHighestRoleFromListForDomain > returns only roles matching the target domain |
| 1601 | 0 | tests/unit/composables/usePolicies.spec.js > usePolicies > getHighestRoleFromListForDomain > includes policies with wildcard domainId |

# Datashare Client Components

This project uses [Vue.js](https://vuejs.org) framework. Here are all the
components used in this application.

## Widget Components

These widgets are used on the insights page.

* [WidgetDiskUsage](components/WidgetDiskUsage.md) <br />— _Widget to display the disk space occupied by indexed files on the insights page._
* [WidgetDocumentsByCreationDate](components/WidgetDocumentsByCreationDate.md) <br />— _Widget to display the number of file by creation date on the insights page._
* [WidgetDocumentsByCreationDateByPath](components/WidgetDocumentsByCreationDateByPath.md) <br />— _Widget to display number of files by creation date by directory on the insights page._
* [WidgetEmpty](components/WidgetEmpty.md) <br />— _A placeholder widget for the insights page._
* [WidgetFileBarometer](components/WidgetFileBarometer.md) <br />— _Widget to display the number of indexed files on the insights page._
* [WidgetText](components/WidgetListGroup.md) <br />— _Widget to display a list of items or links on the insights page._
* [WidgetText](components/WidgetText.md) <br />— _Widget to display text on the insights page._

## Filter Components

These filters are used on the search filters panel.

* [FilterBoilerplate](components/FilterBoilerplate.md) 
* [FilterDate](components/FilterDate.md) 
* [FilterDateRange](components/FilterDateRange.md) 
* [FilterNamedEntity](components/FilterNamedEntity.md) 
* [FilterPath](components/FilterPath.md) 
* [FilterPathTree](components/FilterPathTree.md) 
* [FilterPathTreeNode](components/FilterPathTreeNode.md) 
* [FilterProject](components/FilterProject.md) 
* [FilterRecommendedBy](components/FilterRecommendedBy.md) 
* [FilterSearch](components/FilterSearch.md) 
* [FilterText](components/FilterText.md) 
* [FilterYesNo](components/FilterYesNo.md) 

## Page Components

All pages components.

* [App](pages/App.md) 
* [BatchSearches.vue](pages/BatchSearch.md) 
* [BatchSearchResults](pages/BatchSearchResults.md) 
* [DocumentView](pages/DocumentView.md) 
* [Error](pages/Error.md) 
* [indexing](pages/Indexing.md) 
* [Insights](pages/Insights.md) 
* [Landing](pages/Landing.md) 
* [Login](pages/Login.md) 
* [RouteDoc](pages/RouteDoc.md) 
* [Search](pages/Search.md) 
* [Settings](pages/Settings.md) 
* [UserHistory](pages/UserHistory.md) 

## Other Components

* [AppliedSearchFilters](components/AppliedSearchFilters.md) 
* [AppliedSearchFiltersItem](components/AppliedSearchFiltersItem.md) 
* [AppNav](components/AppNav.md) 
* [AppSidebar](components/AppSidebar.md) 
* [BatchSearchForm](components/BatchSearchForm.md) 
* [BatchSearchResultsFilters](components/BatchSearchResultsFilters.md) 
* [DocumentNotes](components/document/DocumentNotes.md) 
* [DocumentTabDetails](components/document/DocumentTabDetails.md) 
* [DocumentTabExtractedText](components/document/DocumentTabExtractedText.md) 
* [DocumentTabNamedEntities](components/document/DocumentTabNamedEntities.md) 
* [DocumentTabPreview](components/document/DocumentTabPreview.md) 
* [DocumentTabTranslations](components/document/DocumentTabTranslations.md) 
* [ImageViewer](components/document/viewers/ImageViewer.md) 
* [JsonViewer](components/document/viewers/JsonViewer.md) 
* [LegacySpreadsheetViewer](components/document/viewers/LegacySpreadsheetViewer.md) 
* [PaginatedViewer](components/document/viewers/PaginatedViewer.md) 
* [PdfViewer](components/document/viewers/PdfViewer.md) 
* [SpreadsheetViewer](components/document/viewers/SpreadsheetViewer.md) 
* [TiffViewer](components/document/viewers/TiffViewer.md) 
* [DocumentActions](components/DocumentActions.md) 
* [DocumentAttachments](components/DocumentAttachments.md) 
* [DocumentContent](components/DocumentContent.md) 
* [DocumentGlobalSearchTermsTags](components/DocumentGlobalSearchTermsTags.md) 
* [DocumentLocalSearchInput](components/DocumentLocalSearchInput.md) 
* [DocumentSlicedName](components/DocumentSlicedName.md) 
* [DocumentTagsForm](components/DocumentTagsForm.md) 
* [DocumentThread](components/DocumentThread.md) 
* [DocumentThumbnail](components/DocumentThumbnail.md) 
* [DocumentTranslatedContent](components/DocumentTranslatedContent.md) 
* [DocumentTypeCard](components/DocumentTypeCard.md) 
* [EmailString](components/EmailString.md) 
* [ExtractingForm](components/ExtractingForm.md) 
* [FiltersPanel](components/FiltersPanel.md) 
* [FindNamedEntitiesForm](components/FindNamedEntitiesForm.md) 
* [Hook](components/Hook.md) 
* [LocalesMenu](components/LocalesMenu.md) 
* [MountedDataLocation](components/MountedDataLocation.md) 
* [NamedEntityInContext](components/NamedEntityInContext.md) 
* [Pagination](components/Pagination.md) 
* [ProjectCards](components/ProjectCards.md) 
* [ProjectSelector](components/ProjectSelector.md) 
* [ResetFiltersButton](components/ResetFiltersButton.md) 
* [RouteDocsLinks](components/RouteDocsLinks.md) 
* [RouterLinkPopup](components/RouterLinkPopup.md) 
* [ScrollTracker](components/ScrollTracker.md) <br />— _An contextual link to the &quot;right&quot; scroll position._
* [SearchBar](components/SearchBar.md) <br />— _The general search form._
* [SearchDocumentNavbar](components/SearchDocumentNavbar.md) <br />— _Document navbar in the context of a search._
* [SearchLayoutSelector](components/SearchLayoutSelector.md) <br />— _Change the search results layout (grid, list or table)._
* [SearchResults](components/SearchResults.md) <br />— _Display the search results (from the store) in the selected layout._
* [SearchResultsGrid](components/SearchResultsGrid.md) <br />— _Display search results as grid._
* [SearchResultsHeader](components/SearchResultsHeader.md) <br />— _Search results header displaying sorting and page length options._
* [SearchResultsList](components/SearchResultsList.md) <br />— _Display search results as list._
* [SearchResultsLink](components/SearchResultsListLink.md) <br />— _A result link for the search results list._
* [SearchResultsTable](components/SearchResultsTable.md) <br />— _Display search results as table._
* [ShortkeysModal](components/ShortkeysModal.md) <br />— _A button to display global shortcuts in a modal._
* [TreeBreadcrumb](components/TreeBreadcrumb.md) <br />— _A clickable path breadcrumb._
* [TreeView](components/TreeView.md) <br />— _A view listing directories from a specific path._
* [VersionNumber](components/VersionNumber.md) <br />— _Display Datashare&#x27;s version number._

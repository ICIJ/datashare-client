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
* [BatchSearches](pages/BatchSearch.md) 
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

* [AppliedSearchFilters](components/AppliedSearchFilters.md) <br />— _A list of applied search filters._
* [AppliedSearchFiltersItem](components/AppliedSearchFiltersItem.md) <br />— _One applied search filter item._
* [AppNav](components/AppNav.md) <br />— _The global app navigation bar._
* [AppSidebar](components/AppSidebar.md) <br />— _The global app sidebar._
* [BatchSearchForm](components/BatchSearchForm.md) <br />— _A form to create a batch search._
* [BatchSearchResultsFilters](components/BatchSearchResultsFilters.md) <br />— _Form to filter a bash search results by query_
* [DocumentNotes](components/document/DocumentNotes.md) <br />— _A list of notes related to a document&#x27;s path and provided by the backend_
* [DocumentTabDetails](components/document/DocumentTabDetails.md) <br />— _Panel display details and metadate about an indexed document._
* [DocumentTabExtractedText](components/document/DocumentTabExtractedText.md) <br />— _Panel displaying the extract text of a document._
* [DocumentTabNamedEntities](components/document/DocumentTabNamedEntities.md) <br />— _A panel to navigate through the named entities of a document_
* [DocumentTabPreview](components/document/DocumentTabPreview.md) <br />— _A panel displaying a preview for a document._
* [DocumentTabTranslations](components/document/DocumentTabTranslations.md) <br />— _A panel listing a document&#x27;s translations_
* [ImageViewer](components/document/viewers/ImageViewer.md) <br />— _Display a preview image of the document._
* [JsonViewer](components/document/viewers/JsonViewer.md) <br />— _Display an interactive preview of JSON for a document._
* [LegacySpreadsheetViewer](components/document/viewers/LegacySpreadsheetViewer.md) <br />— _Display a legacy preview of spreadsheet for a document, using the XLXS library._
* [PaginatedViewer](components/document/viewers/PaginatedViewer.md) <br />— _Display a paginated preview of a document using the preview server._
* [PdfViewer](components/document/viewers/PdfViewer.md) <br />— _Display a PDF preview of a document._
* [SpreadsheetViewer](components/document/viewers/SpreadsheetViewer.md) <br />— _Display a spreadsheet preview of a document_
* [TiffViewer](components/document/viewers/TiffViewer.md) <br />— _Display a Tiff preview of a document_
* [DocumentActions](components/DocumentActions.md) <br />— _A list actions to apply to a document_
* [DocumentAttachments](components/DocumentAttachments.md) <br />— _A list of attachments for a document (usualy, it&#x27;s child documents)_
* [DocumentContent](components/DocumentContent.md) <br />— _Display a document&#x27;s extract text after applying a series of transformation with a pipeline._
* [DocumentGlobalSearchTermsTags](components/DocumentGlobalSearchTermsTags.md) <br />— _A list of search terms tags._
* [DocumentLocalSearchInput](components/DocumentLocalSearchInput.md) <br />— _A form to search for terms inside the current document._
* [DocumentSlicedName](components/DocumentSlicedName.md) <br />— _Display a document name in a sliced maner (to include parents)._
* [DocumentTagsForm](components/DocumentTagsForm.md) <br />— _A small form to add tags to a one or several documents._
* [DocumentThread](components/DocumentThread.md) <br />— _Display a document&#x27;s thread (for emails)_
* [DocumentThumbnail](components/DocumentThumbnail.md) <br />— _The document&#x27;s thumbnail (using the preview) server_
* [DocumentTranslatedContent](components/DocumentTranslatedContent.md) <br />— _Displayed document text content and it&#x27;s translated alternatives._
* [DocumentTypeCard](components/DocumentTypeCard.md) <br />— _A small card to display information about the content-type of a document._
* [EmailString](components/EmailString.md) <br />— _Rich email display with shortcuts to the global search._
* [ExtractingForm](components/ExtractingForm.md) <br />— _A form to start indexing documents in the data directory._
* [FiltersPanel](components/FiltersPanel.md) 
* [FindNamedEntitiesForm](components/FindNamedEntitiesForm.md) <br />— _A form to start indexing named entities in indexed documents._
* [Hook](components/Hook.md) <br />— _Create a Hook slot. Hooks are registred on-the-fly by plugins to insert arbitrary components._
* [LocalesMenu](components/LocalesMenu.md) <br />— _A button toggling a menu to select active locale._
* [MountedDataLocation](components/MountedDataLocation.md) <br />— _Disk path to the data directory mounted by Datashare._
* [NamedEntityInContext](components/NamedEntityInContext.md) <br />— _Display a named entity in context._
* [Pagination](components/Pagination.md) <br />— _Pagination links (previous, next, first and last) for the global search._
* [ProjectCards](components/ProjectCards.md) <br />— _List all the projects with cards linking to the search._
* [ProjectSelector](components/ProjectSelector.md) <br />— _A single-project selector input._
* [ResetFiltersButton](components/ResetFiltersButton.md) <br />— _Button to reset all search filters._
* [RouteDocsLinks](components/RouteDocsLinks.md) <br />— _Create a list of links to the user-guides._
* [RouterLinkPopup](components/RouterLinkPopup.md) <br />— _A router-link that opens link in a popup._
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

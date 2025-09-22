<script setup>
import { computed, ref, reactive, toRef, watch } from 'vue'
import { flatten, get, matches, identity, orderBy as sortOrderBy, property, trim, trimEnd, uniqBy } from 'lodash'
import bodybuilder from 'bodybuilder'

import Document from '@/api/resources/Document'
import PathTreeView from '@/components/PathTree/PathTreeView/PathTreeView'
import PathTreeViewDocument from '@/components/PathTree/PathTreeView/PathTreeViewDocument'
import PathTreeViewEntry from '@/components/PathTree/PathTreeView/PathTreeViewEntry'
import PathTreeViewEntryBreadcrumb from '@/components/PathTree/PathTreeView/PathTreeViewEntryBreadcrumb'
import PathTreeViewEntryMore from '@/components/PathTree/PathTreeView/PathTreeViewEntryMore'

import {
  LAYOUTS,
  ORDER_BY,
  SORT_BY,
  SOURCE_DIRS,
  SOURCE_DOCS,
  SOURCE_TREE,
  SOURCES_SORT_BY,
  layoutValidator,
  orderByValidator,
  sortByValidator
} from '@/enums/pathTree'
import { useCore } from '@/composables/useCore'
import { usePath } from '@/composables/usePath'
import { useMode } from '@/composables/useMode'
import { useWait } from '@/composables/useWait'
import { apiInstance as api } from '@/api/apiInstance'
import { wildcardRegExpPattern, iwildcardMatch } from '@/utils/strings'

const query = defineModel('query', { type: String })
const selectedPaths = defineModel('selectedPaths', { type: Array, default: () => [] })
const openPaths = defineModel('openPaths', { type: Array, default: () => [] })
const path = defineModel('path', { type: String })
const layout = defineModel('layout', { type: String, default: LAYOUTS.TREE, validator: layoutValidator })

// External props (descriptions preserved).
const props = defineProps({
  /** Whether to display the tree in a compact mode */
  compact: { type: Boolean },
  /** Whether to display the first level of the tree without any padding */
  flush: { type: Boolean },
  /** Display all entries on the same level */
  flat: { type: Boolean },
  /** Whether to display the tree in a select mode */
  selectMode: { type: Boolean },
  /** Whether to allow the selection of several paths */
  multiple: { type: Boolean },
  /** Array of projects to display */
  projects: { type: Array, default: () => [] },
  /** The default path to use when layout changes or when the path is reset. */
  defaultPath: { type: String, default: null },
  /** Deactivate the breadcrumb navigation */
  noBreadcrumb: { type: Boolean },
  /** Deactivate the header label */
  noLabel: { type: Boolean, default: false },
  /** Deactivate the search input */
  noSearch: { type: Boolean },
  /** Deactivate the link to the search */
  noSearchLink: { type: Boolean },
  /** Deactivate clickable links to documents and directories */
  noLink: { type: Boolean },
  /** Deactivate the preview of each entry (only for grid layout) */
  noPreview: { type: Boolean },
  /** Deactivate the placeholder when loading data */
  noPlaceholder: { type: Boolean },
  /** Deactivate the stats display */
  noStats: { type: Boolean },
  /** Deactivate the document listing */
  noDocuments: { type: Boolean },
  /** Whether to display empty directories */
  hideEmpty: { type: Boolean },
  /** Function to apply to the Elasticsearch body before it's built */
  preBodyBuild: { type: Function, default: identity },
  /** If true, the list entries won't have a rounded border radius */
  squared: { type: Boolean },
  /** Key to sort the directories */
  sortBy: { type: String, default: SORT_BY.KEY, validator: sortByValidator },
  /** Order to sort by (asc or desc) */
  orderBy: { type: String, default: ORDER_BY.ASC, validator: orderByValidator },
  /** If true, the document count and size of each directory will include child documents. */
  includeChildrenDocuments: { type: Boolean },
  /** If true, the tree will only display directories that have documents indexed in Elasticsearch. */
  noTree: { type: Boolean },
  /** The level of the tree (for recursive rendering of this component) */
  level: { type: Number, default: 0 }
})

// App services and utilities.
const { core } = useCore()
const { waitFor, isLoading } = useWait()
const { pathSeparator, getBasename, isSelectedPath, isIndeterminateDirectory, trimDirectory, togglePath } = usePath(selectedPaths, props)
const { isServer } = useMode()

// Elasticsearch response paths.
const ES = Object.freeze({
  TOTAL_DOCS: 'directories.hits.total.value',
  TOTAL_DIRS: 'directories.aggregations.total_directories.value',
  TOTAL_SIZE: 'directories.aggregations.total_size.value',
  DIR_BUCKETS: 'directories.aggregations.dirname.buckets',
  DOC_HITS: 'documents.hits.hits'
})

// Paginated pages from ES.
const pages = ref([])
// Raw /tree results.
const tree = ref([])
// Child entry refs for reloads.
const entriesRefs = reactive({})
// Map dirname -> hasDocs (to adjust directory counts).
const directoryIsEmpty = ref({})

// Page size constant.
const PER_PAGE = 50
// Current total loaded items offset.
const offset = computed(() => (directories.value.length + documents.value.length) || 0)
// Next offset to request from ES.
const nextOffset = computed(() => offset.value + PER_PAGE)
// Current page index (0-based).
const page = computed(() => Math.floor(offset.value / PER_PAGE))
// First aggregated ES page.
const firstPage = computed(() => pages.value[0] || {})
// Last aggregated ES page.
const lastPage = computed(() => pages.value[pages.value.length - 1] || {})
// Last page directory buckets.
const lastPageDirectories = computed(() => get(lastPage.value, ES.DIR_BUCKETS, []))
// Last page document hits.
const lastPageDocuments = computed(() => get(lastPage.value, ES.DOC_HITS, []))
// Level for nested rendering (0 when flat).
const nextLevel = computed(() => (props.flat ? 0 : props.level + 1))
// Whether the free-text query is non-empty.
const hasQuery = computed(() => Boolean(query.value && trim(query.value)))
// Normalized current path without trailing separator.
const trimmedPath = computed(() => trimDirectory(path.value))
// Wildcard version of the query (lowercased).
const wildcardQuery = computed(() => (hasQuery.value ? `*${query.value.toLowerCase()}*` : '*'))
// Whether the last fetched page is shorter than PER_PAGE.
const reachedTheEnd = computed(() => lastPageDirectories.value.length + lastPageDocuments.value.length < PER_PAGE)
// Whether we should call the /tree API (client FS) now.
const shouldLoadTree = computed(() => reachedTheEnd.value && !isServer.value && !props.noTree)
// Total document count (from first page).
const totalDocuments = computed(() => get(firstPage.value, ES.TOTAL_DOCS, 0))
// Total directory count excluding current folder bucket.
const totalDirectories = computed(() => Math.max(0, get(firstPage.value, ES.TOTAL_DIRS, 0) - 1))
// Total size across buckets (from first page).
const totalSize = computed(() => get(firstPage.value, ES.TOTAL_SIZE, 0))
// Sort order for directory aggregation.
const orderDirectories = computed(() => ({ [SOURCES_SORT_BY[props.sortBy][SOURCE_DIRS]]: props.orderBy }))
// Sort order for documents hits.
const orderDocuments = computed(() => ([{ [SOURCES_SORT_BY[props.sortBy][SOURCE_DOCS]]: props.orderBy }]))
// Sort order for client /tree projection.
const orderTree = computed(() => ([[SOURCES_SORT_BY[props.sortBy][SOURCE_TREE]], [props.orderBy]]))
// ES terms options for dirname.tree aggregation.
const dirnameTreeAggOptions = computed(() => {
  const wildcardPath = [trimmedPath.value, '*'].join(pathSeparator.value)
  const wildcardSubPath = [trimmedPath.value, '*', '*'].join(pathSeparator.value)
  return {
    include: wildcardRegExpPattern(wildcardPath),
    exclude: wildcardRegExpPattern(wildcardSubPath),
    size: nextOffset.value,
    order: orderDirectories.value
  }
})

/**
 * Check if a path matches the current wildcard query (case-insensitive).
 * @param {string} path - Path to test against the wildcard pattern.
 * @return {boolean} True when it matches or when no query is set.
 */
function pathMatchQuery(path) {
  if (hasQuery.value) {
    return iwildcardMatch(getBasename(path), wildcardQuery.value)
  }
  return true
}

/**
 * Flatten a nested path from all pages into a single array.
 * @param {string} propPath - Lodash get() path to extract from each page.
 * @return {any[]} Flattened array of items from all pages.
 */
function flatFromPages(propPath) {
  return flatten(pages.value.map(pg => get(pg, propPath, [])))
}

// Directories derived from client /tree as ES-like buckets.
const treeAsDirectories = computed(() => sortOrderBy(
  (tree.value ?? [])
    // Only directories matching the query
    .filter(({ name, type }) => type === 'directory' && pathMatchQuery(name))
    // Map to ES-like bucket structure with zeroed stats
    .map(({ name: key }) => ({ key, size: 0, doc_count: 0, directories: { value: null } })),
  ...orderTree.value
))

// Documents derived from client /tree as ES-like hits.
const treeAsDocuments = computed(() => sortOrderBy(
  (tree.value ?? [])
    // Only files matching the query
    .filter(({ name, type }) => type === 'file' && pathMatchQuery(name))
    // Map to ES-like hit structure
    .map(({ name: path, size: contentLength }) => {
      const title = getBasename(path)
      const dirname = trimEnd(path.split(title).shift(), pathSeparator.value)
      const extractionLevel = 0
      const type = 'Document'
      return Document.create({
        _id: path,
        _index: null,
        _source: {
          title,
          path,
          contentLength,
          extractionLevel,
          type,
          dirname
        }
      })
    }),
  ...orderTree.value
))

// Directories merged from ES pages and client /tree.
const directories = computed(() => {
  const buckets = flatFromPages(ES.DIR_BUCKETS)
  const all = uniqBy([...buckets, ...treeAsDirectories.value], 'key')
  return props.hideEmpty ? all.filter(d => d.doc_count > 0) : all
})

// Documents merged from ES pages and client /tree.
const pagesDocuments = computed(() => flatFromPages(ES.DOC_HITS).map(Document.create))
const documents = computed(() => (props.noDocuments ? [] : uniqBy([...pagesDocuments.value, ...treeAsDocuments.value], 'path')))

/**
 * Return whether a directory is currently collapsed.
 * @param {string} key - Directory key path.
 * @return {boolean} True if the directory is collapsed.
 */
function isCollapsedDirectory(key) {
  return !openPaths.value.includes(key)
}

/**
 * Toggle a directory open/closed in TREE layout or navigate to it in other layouts.
 * @param {string} key - Directory key path.
 * @return {void}
 */
function collapseDirectory(key) {
  if (layout.value === LAYOUTS.TREE) {
    if (isCollapsedDirectory(key)) {
      openPaths.value = [...openPaths.value, key]
    }
    else {
      openPaths.value = openPaths.value.toSpliced(openPaths.value.indexOf(key), 1)
    }
  }
  else if (!props.noLink) {
    path.value = trimDirectory(key)
  }
}

/**
 * Compute the number of sub-directories for a given directory key.
 * Adjusts when the current folder is empty to avoid counting itself.
 * @param {string} key - Directory key path.
 * @return {number} Count of sub-directories.
 */
function getDirectoryCount(key) {
  const bucket = directories.value.find(matches({ key }))
  if (bucket?.directories) {
    return Math.max(0, bucket.directories.value - (directoryIsEmpty.value[key] ?? 0))
  }
  return 0
}

/**
 * Build the Elasticsearch body for the directory aggregation page.
 * @param {Object} [options] - Pagination options.
 * @param {number} [options.from=0] - Offset for bucket_sort.
 * @param {number} [options.size=PER_PAGE] - Page size for bucket_sort.
 * @return {any} Configured bodybuilder instance (call .build()).
 */
function getDirectoriesBodybuilder({ from = 0, size = PER_PAGE } = {}) {
  const bb = bodybuilder()
  // Ensure we get accurate hit counts, even if they exceed 10,000
  bb.rawOption('track_total_hits', true)
  // Only include Document-type entries
  bb.andQuery('match', 'type', 'Document')
  // Filter to all dirname values matching our wildcard pattern (case-insensitive),
  // this include the current path and all sub-paths.
  bb.andQuery('wildcard', 'dirname', { value: wildcardQuery.value, case_insensitive: true })
  bb.andQuery('term', 'dirname.tree', trimmedPath.value)
  // Aggregate by directory tree, with pagination and optional sub-aggs:
  // * "terms" is the aggregation type
  // * "dirname.tree" is the field to aggregate on
  // * "dirnameTreeAggOptions.value" is the options for the aggregation
  // * "dirname" is the name of the aggregation
  // * The inner function is used to define sub-aggregations and pagination for each terms bucket
  bb.agg('terms', 'dirname.tree', dirnameTreeAggOptions.value, 'dirname', (inner) => {
    // Sort and paginate each terms bucket
    inner.agg('bucket_sort', { size, from }, 'bucket_truncate')
    // We need the size of each directory for sorting
    inner.agg('sum', 'contentLength', 'size')
    // In "full" mode (not compact), add directory-count sub-aggs
    if (!props.compact || props.noStats) {
      inner.agg('cardinality', 'dirname', 'directories')
    }
    return inner
  })
  // If we only want top-level extractions, filter out child documents
  if (!props.includeChildrenDocuments) {
    bb.andQuery('match', 'extractionLevel', 0)
  }
  // In "full" mode (not compact), add top-level totals across all buckets
  if (!props.compact || props.noStats) {
    bb.agg('sum', 'contentLength', 'total_size')
    bb.agg('cardinality', 'dirname', 'total_directories')
  }
  // Allow any last-minute tweaks (e.g. additional filters),
  // then return the configured bodybuilder instance
  return props.preBodyBuild(bb)
}

/**
 * Fetch one page of directory buckets from Elasticsearch and compute emptiness map.
 * @param {Object} [options] - Options for fetching.
 * @param {boolean} [options.clearPages=false] - If true, start from offset 0.
 * @return {Promise<any>} Elasticsearch response with aggregations.
 */
async function fetchDirectories({ clearPages = false } = {}) {
  const index = props.projects.join(',')
  const from = clearPages ? 0 : offset.value
  const body = getDirectoriesBodybuilder({ from }).build()
  const preference = 'tree-view-directories'
  const res = await api.elasticsearch.search({ index, body, preference })
  if (!props.compact) {
    const dirs = res.aggregations.dirname.buckets.map(property('key'))
    await fetchEmptyDirectories(dirs)
  }
  return res
}

/**
 * Build an Elasticsearch body to count documents per provided dirname.
 * @param {string[]} [dirs=[]] - List of dirnames to check.
 * @return {any} Configured bodybuilder instance (call .build()).
 */
function getEmptyDirectoriesBodybuilder(dirs = []) {
  const bb = bodybuilder().size(0)
  // Only include Document-type entries on disk
  bb.andQuery('match', 'type', 'Document')
  bb.andQuery('match', 'extractionLevel', 0)
  bb.rawOption('aggregations', {
    doc_count_by_dirname: {
      filters: {
        filters: dirs.reduce((acc, dirname) => {
          return {
            ...acc,
            [dirname]: {
              term: {
                dirname
              }
            }
          }
        }, {})
      }
    }
  })
  return bb
}

/**
 * Populate the directoryIsEmpty map using Elasticsearch counts for each dirname.
 * @param {string[]} [dirs=[]] - List of dirnames to check.
 * @return {Promise<void>} Resolves when the map has been updated.
 */
async function fetchEmptyDirectories(dirs = []) {
  if (!dirs.length) {
    return
  }
  const index = props.projects.join(',')
  const preference = 'tree-view-empty-directories'
  const body = getEmptyDirectoriesBodybuilder(dirs).build()
  const res = await api.elasticsearch.search({ index, body, preference })
  const buckets = get(res, 'aggregations.doc_count_by_dirname.buckets', {})
  Object.entries(buckets).forEach(([key, { doc_count }]) => {
    directoryIsEmpty.value[key] = !!doc_count
  })
}

/**
 * Build the Elasticsearch body for fetching document hits.
 * @param {Object} [options] - Pagination options.
 * @param {number} [options.from=0] - Hit offset.
 * @param {number} [options.size=PER_PAGE] - Hit limit.
 * @return {any} Configured bodybuilder instance (call .build()).
 */
function getDocumentsBodybuilder({ from = 0, size = PER_PAGE } = {}) {
  const bb = bodybuilder().from(from).size(size)
  bb.rawOption('sort', orderDocuments.value)
  // Filter to the current path only
  bb.andQuery('term', 'dirname', trimmedPath.value)
  // Only include Document-type entries on disk
  bb.andQuery('match', 'extractionLevel', 0)
  bb.andQuery('match', 'type', 'Document')
  if (hasQuery.value) {
    bb.orQuery('wildcard', 'path', { value: wildcardQuery.value, case_insensitive: true })
    bb.orQuery('wildcard', 'title', { value: wildcardQuery.value, case_insensitive: true })
  }
  return bb
}

/**
 * Fetch a page of documents to fill remaining page space after directories.
 * @return {Promise<any|null>} ES response or null when documents are disabled or no room.
 */
async function fetchDocuments() {
  const room = PER_PAGE - lastPageDirectories.value.length
  if (props.noDocuments || room <= 0 || !props.projects.length) {
    return null
  }
  const index = props.projects.join(',')
  const from = pagesDocuments.value.length
  const size = room
  const body = getDocumentsBodybuilder({ from, size }).build()
  const preference = 'tree-view-documents'
  const _source = 'title,dirname,path,contentType,contentLenght,extractionLevel'
  return api.elasticsearch.search({ index, body, preference, _source })
}

/**
 * Reset pagination and local tree cache.
 * @return {void}
 */
function clearAllPages() {
  pages.value.splice(0, pages.value.length)
  tree.value = []
}

/**
 * Load directories, then documents, then optional /tree.
 * @param {Object} [options] - Load options.
 * @param {boolean} [options.clearPages=false] - If true, start fresh.
 * @return {Promise<void>} Resolves when loading is complete.
 */
async function loadData({ clearPages = false } = {}) {
  if (clearPages) {
    clearAllPages()
  }
  if (props.projects.length) {
    const directories = await fetchDirectories({ clearPages })
    pages.value.push({ directories })
    lastPage.value.documents = await fetchDocuments()
  }
  if (clearPages) {
    await loadTree()
  }
}

/**
 * Same as loadData but wrapped with a spinner state.
 * @type {(opts?: {clearPages?: boolean}) => Promise<void>}
 */
const loadDataWithSpinner = waitFor(loadData)

/**
 * Refresh child entries via refs and reload pages.
 * @return {Promise<void>} Resolves when reloading is complete.
 */
async function reloadData() {
  for (const key in entriesRefs) {
    await entriesRefs[key]?.reloadData?.()
  }
  await loadData({ clearPages: true })
}

/**
 * Infinite loader callback used by virtual scrollers.
 * @param {any} $infiniteLoadingState - Component state with loaded()/complete() methods.
 * @return {Promise<void>} Resolves after invoking the appropriate state method.
 */
async function nextLoadData($infiniteLoadingState) {
  await loadData()
  const method = reachedTheEnd.value ? 'complete' : 'loaded'
  return get($infiniteLoadingState, method, () => null)()
}

/**
 * Retrieve on-disk tree when ES pagination is exhausted or tree mode enabled.
 * @return {Promise<void>} Resolves after tree has been loaded or cleared.
 */
async function loadTree() {
  tree.value = shouldLoadTree.value
    ? await api.tree(trimmedPath.value).then(property('contents')).catch(() => [])
    : []
}

// Reload when path changes (immediate on mount).
watch(path, () => loadDataWithSpinner({ clearPages: true }), { immediate: true })
// Reload when directory order changes.
watch(orderDirectories, () => loadDataWithSpinner({ clearPages: true }))
// Reload when query changes.
watch(query, () => loadDataWithSpinner({ clearPages: true }))
// Reload when projects change.
watch(toRef(props, 'projects'), () => loadDataWithSpinner({ clearPages: true, deep: true }))
// Reset open paths and restore default when toggling TREE layout.
watch(layout, (value, oldValue) => {
  if (value === LAYOUTS.TREE || oldValue === LAYOUTS.TREE) {
    openPaths.value = []
    path.value = trimDirectory(props.defaultPath ?? core.getDefaultDataDir())
  }
})

// Expose for parent components.
defineExpose({ isLoading, loadData, loadDataWithSpinner, reloadData })
</script>

<template>
  <div class="path-tree">
    <path-tree-view
      v-model:query="query"
      v-model:layout="layout"
      :is-loading="isLoading"
      :level="level"
      :no-label="noLabel"
      :no-placeholder="noPlaceholder"
      :no-stats="noStats"
      :no-search="noSearch"
      :select-mode="selectMode"
      :multiple="multiple"
      :compact="compact"
      :flat="flat"
      :loading="isLoading"
    >
      <template #before>
        <slot name="before" />
      </template>
      <template #after>
        <slot name="after" />
      </template>
      <path-tree-view-entry
        :loading="isLoading"
        :name="getBasename(path)"
        :path="path"
        :projects="projects"
        :selected="isSelectedPath(path)"
        :documents="totalDocuments"
        :directories="totalDirectories"
        :size="totalSize"
        :compact="compact"
        :flush="flush"
        :indeterminate="isIndeterminateDirectory(path)"
        :no-header="level > 0 || noBreadcrumb"
        :no-link="noLink || layout !== LAYOUTS.TREE"
        :no-stats="noStats"
        :no-search-link="noSearchLink || layout === LAYOUTS.GRID"
        :layout="layout"
        :level="level"
        @update:selected="togglePath(path)"
      >
        <template
          v-if="layout !== LAYOUTS.TREE"
          #name
        >
          <path-tree-view-entry-breadcrumb
            :compact="compact"
            :model-value="path"
            @update:model-value="collapseDirectory($event)"
          />
        </template>
        <path-tree-view-entry
          v-for="directory in directories"
          :key="directory.key"
          :loading="!!entriesRefs[directory.key]?.isLoading"
          :name="getBasename(directory.key)"
          :path="directory.key"
          :projects="projects"
          :documents="directory.doc_count"
          :directories="getDirectoryCount(directory.key)"
          :size="directory.size?.value"
          :selected="isSelectedPath(directory.key)"
          :collapse="isCollapsedDirectory(directory.key)"
          :compact="compact"
          :no-documents="noDocuments"
          :no-link="noLink"
          :no-preview="noPreview"
          :no-stats="noStats"
          :no-search-link="noSearchLink"
          :indeterminate="isIndeterminateDirectory(directory.key)"
          :layout="layout"
          :level="nextLevel"
          :squared="squared"
          :sort-by="sortBy"
          :order-by="orderBy"
          @update:selected="togglePath(directory.key)"
          @update:collapse="collapseDirectory(directory.key)"
          @update:path="path = $event"
        >
          <template
            v-if="layout === LAYOUTS.TREE"
            #default="{ collapse }"
          >
            <path-tree
              v-if="!collapse"
              :ref="(el) => (entriesRefs[directory.key] = el)"
              v-model:selected-paths="selectedPaths"
              v-model:open-paths="openPaths"
              v-model:layout="layout"
              no-label
              no-placeholder
              no-search
              :flat="flat"
              :level="nextLevel"
              :squared="squared"
              :path="directory.key"
              :projects="projects"
              :select-mode="selectMode"
              :multiple="multiple"
              :no-link="noLink"
              :no-preview="noPreview"
              :no-search-link="noSearchLink"
              :no-stats="noStats"
              :no-documents="noDocuments"
              :compact="compact"
              :pre-body-build="preBodyBuild"
              :sort-by="sortBy"
              :order-by="orderBy"
              :no-tree="noTree"
              :include-children-documents="includeChildrenDocuments"
            />
          </template>
        </path-tree-view-entry>
        <path-tree-view-document
          v-for="document in documents"
          :key="document.path"
          :selected="isSelectedPath(document.path)"
          :select-mode="selectMode"
          :compact="compact"
          :entry="document"
          :level="nextLevel"
          :layout="layout"
          :squared="squared"
          :no-link="noLink || !document.index"
          @update:selected="togglePath(document.path)"
        />
        <path-tree-view-entry-more
          v-if="!reachedTheEnd"
          :layout="layout"
          :flat="flat"
          :level="nextLevel"
          :per-page="perPage"
          :page="page"
          :total="totalDirectories"
          @click="nextLoadData"
        />
      </path-tree-view-entry>
    </path-tree-view>
  </div>
</template>

<script setup>
import { onBeforeMount, computed, ref, reactive, toRef, watch } from 'vue'
import { flatten, filter, get, matches, identity, includes, property, trim, trimEnd, uniqBy } from 'lodash'
import bodybuilder from 'bodybuilder'

import PathTreeView from '@/components/PathTree/PathTreeView/PathTreeView'
import PathTreeViewEntry from '@/components/PathTree/PathTreeView/PathTreeViewEntry'
import PathTreeViewEntryBreadcrumb from '@/components/PathTree/PathTreeView/PathTreeViewEntryBreadcrumb'
import PathTreeViewEntryMore from '@/components/PathTree/PathTreeView/PathTreeViewEntryMore'
import { useCore } from '@/composables/useCore'
import { useMode } from '@/composables/useMode'
import { useWait } from '@/composables/useWait'
import { wildcardRegExpPattern, iwildcardMatch } from '@/utils/strings'

const query = defineModel('query', { type: String })
const selectedPaths = defineModel('selectedPaths', { type: Array, default: () => [] })
const openPaths = defineModel('openPaths', { type: Array, default: () => [] })
const path = defineModel('path', { type: String })
const nested = defineModel('nested', { type: Boolean })

const props = defineProps({
  /**
   * Whether to display the tree in a compact mode
   */
  compact: { type: Boolean },
  /**
   * Whether to display the tree in a select mode
   */
  selectMode: { type: Boolean },
  /**
   * Whether to allow the selection of several paths
   */
  multiple: { type: Boolean },
  /**
   * Array of projects to display
   */
  projects: {
    type: Array,
    default: () => []
  },
  /**
   * Deactivate the header label
   */
  noLabel: { type: Boolean, default: false },
  /**
   * Deactivate the search input
   */
  noSearch: { type: Boolean },
  /**
   * Deactivate the link to the search
   */
  noLink: { type: Boolean },
  /**
   * Deactivate the stats display
   */
  noStats: { type: Boolean },
  /**
   * Whether to display empty directories
   */
  hideEmpty: { type: Boolean },
  /**
   * Function to apply to the Elasticsearch body before it's built
   */
  preBodyBuild: { type: Function, default: identity },
  /**
   * Key to sort the directories
   */
  sortBy: {
    type: String,
    default: 'size',
    validator: (order) => {
      return includes(['_count', '_key', 'size'], order)
    }
  },
  /**
   * Order to sort by (asc or desc)
   */
  orderBy: {
    type: String,
    default: 'desc',
    validator: (order) => {
      return includes(['asc', 'desc'], order)
    }
  },
  /**
   * If true, the document count and size of each directory will include
   * child documents.
   */
  includeChildrenDocuments: { type: Boolean },
  /**
   * If true, the tree will only display directories that have documents
   * indexed in Elasticsearch.
   */
  elasticsearchOnly: { type: Boolean },
  /**
   * The level of the tree (for recursive rendering of this component)
   */
  level: { type: Number, default: 0 }
})

const { core } = useCore()
const { waitFor, isLoading } = useWait()

const pages = ref([])
const directoriesRefs = reactive({})
const tree = ref({ contents: [] })
const perPage = 50

const lastPage = computed(() => {
  return pages.value[pages.value.length - 1] || {}
})

const lastPageDirectories = computed(() => {
  return get(lastPage.value, 'aggregations.dirname.buckets', [])
})

const offset = computed(() => {
  return directories.value.length || 0
})

const nextOffset = computed(() => {
  return offset.value + perPage
})

const page = computed(() => {
  return Math.floor(offset.value / perPage)
})

const order = computed(() => {
  return { [props.sortBy]: props.orderBy }
})

const hasQuery = computed(() => {
  return query.value && trim(query.value)
})

watch(query, () => loadDataWithSpinner({ clearPages: true }))
watch(order, () => loadDataWithSpinner({ clearPages: true }))
watch(path, () => loadDataWithSpinner({ clearPages: true }))
watch(toRef(props, 'projects'), () => loadDataWithSpinner({ clearPages: true, deep: true }))
// When nested value change, we restore the path
watch(nested, () => {
  path.value = core.getDefaultDataDir()
  openPaths.value = []
})

const dirnameTreeAggOptions = computed(() => {
  return {
    include: includeOption.value,
    exclude: excludeOption.value,
    size: nextOffset.value,
    order: order.value
  }
})

const reachedTheEnd = computed(() => {
  return lastPageDirectories.value.length < perPage
})

const treeChildren = computed(() => {
  return filter(tree.value?.contents ?? [], { type: 'directory' })
})

const pathSeparator = computed(() => {
  return core.config.get('pathSeparator', '/')
})

const wildcardQuery = computed(() => {
  return hasQuery.value ? '*' + query.value.toLowerCase() + '*' : '*'
})

const wildcardPath = computed(() => {
  return [path.value, '*'].join(pathSeparator.value)
})

const wildcardSubPath = computed(() => {
  return [path.value, '*', '*'].join(pathSeparator.value)
})

const includeOption = computed(() => {
  // Convert the path with a wildcard to regex
  return wildcardRegExpPattern(wildcardPath.value)
})

const excludeOption = computed(() => {
  return wildcardRegExpPattern(wildcardSubPath.value)
})

const treeAsPagesBuckets = computed(() => {
  return (
    treeChildren.value
      // Only keep directories
      .filter(({ type }) => type === 'directory')
      // Only keep the ones matching with the query
      .filter(({ name }) => {
        if (hasQuery.value) {
          // Compare only with the dirname
          const dirname = name.split(pathSeparator.value).pop()
          // And use case-insensitive wildcard match
          return iwildcardMatch(dirname, wildcardQuery.value)
        }
        return true
      })
      // Transform it to match with the ES aggregation format
      .map(({ name: key }) => {
        return { key, size: 0, doc_count: 0, directories: { value: null } }
      })
  )
})

const directories = computed(() => {
  const buckets = flatten(pages.value.map((p) => get(p, 'aggregations.dirname.buckets', [])))
  const allDirectories = uniqBy([...buckets, ...treeAsPagesBuckets.value], 'key')
  return props.hideEmpty ? allDirectories.filter((dir) => dir.doc_count > 0) : allDirectories
})

const isCollapsedDirectory = (key) => {
  return !openPaths.value.includes(key)
}

const collapseDirectory = (key) => {
  if (nested.value) {
    if (isCollapsedDirectory(key)) {
      openPaths.value = [...openPaths.value, key]
    } else {
      openPaths.value = openPaths.value.toSpliced(openPaths.value.indexOf(key), 1)
    }
  } else {
    path.value = key
  }
}

const toDirectory = (path) => {
  return trimEnd(path, pathSeparator.value) + pathSeparator.value
}

const isSelectedDirectory = (key) => {
  return selectedPaths.value.map(toDirectory).includes(toDirectory(key))
}

const isIndeterminateDirectory = (key) => {
  return selectedPaths.value.some((path) => {
    return toDirectory(path).startsWith(toDirectory(key)) && !isSelectedDirectory(key)
  })
}

const selectDirectory = (key) => {
  const dir = toDirectory(key)
  if (isSelectedDirectory(key)) {
    selectedPaths.value = selectedPaths.value.toSpliced(selectedPaths.value.indexOf(dir), 1)
  } else if (props.multiple) {
    selectedPaths.value = [...selectedPaths.value, dir]
  } else {
    selectedPaths.value = selectedPaths.value.toSpliced(0, selectedPaths.value.length, dir)
  }
}

const getDirectoryCount = (key) => {
  const directory = directories.value.find(matches({ key }))
  if (directory?.directories) {
    // If the directory is empty, we need to return the number of directories
    // minus the number of the current directory.
    return Math.max(0, directory.directories.value - (directoryIsEmpty.value[key] ?? 0))
  }
  return 0
}

const getBasename = (value) => {
  return value.split(pathSeparator.value).pop()
}

/**
 * Builds an Elasticsearch query with optional pagination,
 * total-size aggregations, and extraction-level filtering.
 *
 * @param {Object} options
 * @param {number} options.from – Pagination offset for bucket_sort (default 0)
 * @param {number} options.size – Pagination limit for bucket_sort (default 100)
 * @returns {Bodybuilder} – A bodybuilder instance ready for .build()
 */
const getBodybuilder = ({ from = 0, size = 100 } = {}) => {
  // Start with an empty body, no hits returned (we only care about aggs)
  const body = bodybuilder().size(0)
  // Ensure we get accurate hit counts, even if they exceed 10,000
  body.rawOption('track_total_hits', true)
  // Filter to all dirname values matching our wildcard pattern (case-insensitive),
  // this include the current path and all sub-paths.
  body.andQuery('wildcard', 'dirname', { value: wildcardQuery.value, case_insensitive: true })
  // Filter to paths exactly matching our target tree node
  body.andQuery('term', 'dirname.tree', path.value)
  // Only include Document-type entries
  body.andQuery('match', 'type', 'Document')
  // Aggregate by directory tree, with pagination and optional sub-aggs:
  //
  // * "terms" is the aggregation type
  // * "dirname.tree" is the field to aggregate on
  // * "dirnameTreeAggOptions.value" is the options for the aggregation
  // * "dirname" is the name of the aggregation
  // * The inner function is used to define sub-aggregations and pagination for each terms bucket
  body.agg('terms', 'dirname.tree', dirnameTreeAggOptions.value, 'dirname', (inner) => {
    // Sort and paginate each terms bucket
    inner.agg('bucket_sort', { size, from }, 'bucket_truncate')
    // In "full" mode (not compact), add sum and directory-count sub-aggs
    if (!props.compact) {
      inner.agg('sum', 'contentLength', 'size')
      inner.agg('cardinality', 'dirname', 'directories')
    }
    return inner
  })

  // If we only want top-level extractions, filter out child documents
  if (!props.includeChildrenDocuments) {
    body.andQuery('match', 'extractionLevel', 0)
  }

  // In "full" mode (not compact), add top-level totals across all buckets
  if (!props.compact) {
    body.agg('sum', 'contentLength', 'total_size')
    body.agg('cardinality', 'dirname', 'total_directories')
  }

  // Allow any last-minute tweaks (e.g. additional filters),
  // then return the configured bodybuilder instance
  return props.preBodyBuild(body)
}

const directoryIsEmpty = ref({})

// This function will check if the directories are empty or not
// and will save the result in the directoryIsEmpty object. We need
// to check if the directory is empty to adjust the directory count
// in the tree view to not count the current directory when it doesn't
// have any documents.
const fetchEmptyDirectory = async (dirs = []) => {
  if (!dirs.length) return

  const index = props.projects.join(',')
  const preference = 'tree-view-paths-count'
  const body = bodybuilder()
    .size(0)
    .andQuery('match', 'type', 'Document')
    .andQuery('match', 'extractionLevel', 0)
    .rawOption('aggregations', {
      doc_count_by_dirname: {
        filters: {
          filters: {
            // This is a bit tricky, but we need to use the "dirname" field to
            // filter the directories and not the "dirname.tree" field. Then we create
            // a filter for each directory to check if it has documents or not.
            ...dirs.reduce((acc, dirname) => {
              const term = { dirname }
              return { ...acc, [dirname]: { term } }
            }, {})
          }
        }
      }
    })
    .build()

  const res = await core.api.elasticsearch.search({ index, body, preference })
  const buckets = get(res, 'aggregations.doc_count_by_dirname.buckets', {})
  // Save a document count for each directory
  Object.entries(buckets).forEach(([key, { doc_count: count }]) => (directoryIsEmpty.value[key] = !!count))
}

const loadData = async ({ clearPages = false } = {}) => {
  // Only load data if there are any projects
  if (props.projects.length) {
    const index = props.projects.join(',')
    const from = clearPages ? 0 : offset.value
    const size = perPage
    const body = getBodybuilder({ from, size }).build()
    const preference = 'tree-view-paths-terms'
    const res = await core.api.elasticsearch.search({ index, body, preference })
    // When the number of directories is displayed,
    // we need to fetch the number of empty directories to adjust the
    // directory count in the tree view. Unfortunely, this cannot
    // be done in the same request as the aggregation because
    // we need the list of directories to check if they are empty or not.
    if (!props.compact) {
      const dirs = res.aggregations.dirname.buckets.map(property('key'))
      await fetchEmptyDirectory(dirs)
    }
    // Clear the list of pages (to start over!)
    if (clearPages) await clearPagesAndLoadTree()
    // Add the result as a page
    pages.value.push(res)
  } else if (clearPages) {
    // If no projects are given and we are clearing the pages,
    // we should load the tree anyway.
    await loadTree()
  }
}

const loadDataWithSpinner = waitFor(async (...args) => {
  await loadData(...args)
})

const reloadData = async () => {
  for (const key in directoriesRefs) {
    await directoriesRefs[key]?.reloadData()
  }
  await loadData({ clearPages: true })
}

const nextLoadData = async ($infiniteLoadingState) => {
  await loadData()
  // Did we reach the end?
  const method = reachedTheEnd.value ? 'complete' : 'loaded'
  // Call the right method (with "noop" as safety net in case the method can't be found)
  return get($infiniteLoadingState, method, () => null)()
}

const clearPages = () => {
  return pages.value.splice(0, pages.value.length)
}

const loadTree = async () => {
  try {
    if (shouldLoadTree.value) {
      tree.value = await core.api.tree(path.value)
    }
  } catch {
    tree.value = { contents: [] }
  }
}

const { isServer } = useMode()
const shouldLoadTree = computed(() => {
  // The /tree API is disabled in server so we ensure
  // the mode is correct before running it.
  // Only load the tree if we clear out the pages
  // and entirely load the folder. This way we avoid
  // load directories from the /tree API when they are
  // already present in next result page of the
  // ElasticSearch aggregation.
  return reachedTheEnd.value && !isServer.value && !props.elasticsearchOnly
})

const clearPagesAndLoadTree = async () => {
  clearPages()
  await loadTree()
}

const totalDocuments = computed(() => {
  return get(lastPage.value, 'hits.total.value', 0)
})

const totalDirectories = computed(() => {
  return Math.max(0, get(lastPage.value, 'aggregations.total_directories.value', 0) - 1)
})

const totalSize = computed(() => {
  return get(lastPage.value, 'aggregations.total_size.value', 0)
})

onBeforeMount(() => {
  return loadDataWithSpinner({ clearPages: true })
})

defineExpose({ loadData, loadDataWithSpinner, reloadData, isLoading })
</script>

<template>
  <div class="path-tree">
    <path-tree-view
      v-model:query="query"
      v-model:nested="nested"
      :no-label="noLabel"
      :no-search="noSearch"
      :select-mode="selectMode"
      :multiple="multiple"
      :compact="compact"
    >
      <path-tree-view-entry
        :loading="isLoading"
        :name="getBasename(path)"
        :path="path"
        :projects="projects"
        :selected="isSelectedDirectory(path)"
        :documents="totalDocuments"
        :directories="totalDirectories"
        :size="totalSize"
        :compact="compact"
        :indeterminate="isIndeterminateDirectory(path)"
        :no-header="level > 0"
        :no-stats="noStats"
        :no-link="noLink"
        :nested="nested"
        :level="level"
        @update:selected="selectDirectory(path)"
      >
        <template v-if="!nested" #name>
          <path-tree-view-entry-breadcrumb
            :compact="compact"
            :model-value="path"
            @update:model-value="collapseDirectory($event)"
          />
        </template>
        <path-tree-view-entry
          v-for="directory in directories"
          :key="directory"
          :loading="!!directoriesRefs[directory.key]?.isLoading"
          :name="getBasename(directory.key)"
          :path="directory.key"
          :projects="projects"
          :documents="directory.doc_count"
          :directories="getDirectoryCount(directory.key)"
          :size="directory.size?.value"
          :selected="isSelectedDirectory(directory.key)"
          :collapse="isCollapsedDirectory(directory.key)"
          :compact="compact"
          :no-stats="noStats"
          :no-link="noLink"
          :data="JSON.stringify(directory)"
          :indeterminate="isIndeterminateDirectory(directory.key)"
          :nested="nested"
          :level="level + 1"
          @update:selected="selectDirectory(directory.key)"
          @update:collapse="collapseDirectory(directory.key)"
        >
          <template v-if="nested" #default="{ collapse }">
            <path-tree
              v-if="!collapse"
              :ref="(el) => (directoriesRefs[directory.key] = el)"
              v-model:selected-paths="selectedPaths"
              v-model:open-paths="openPaths"
              v-model:nested="nested"
              no-label
              no-search
              :level="level + 1"
              :path="directory.key"
              :projects="projects"
              :select-mode="selectMode"
              :multiple="multiple"
              :no-link="noLink"
              :no-stats="noStats"
              :compact="compact"
              :pre-body-build="preBodyBuild"
              :sort-by="sortBy"
              :order-by="orderBy"
              :elasticsearch-only="elasticsearchOnly"
              :include-children-documents="includeChildrenDocuments"
            />
          </template>
        </path-tree-view-entry>
        <path-tree-view-entry-more
          v-if="!reachedTheEnd"
          :total="totalDirectories"
          :per-page="perPage"
          :page="page"
          @click="nextLoadData"
        />
      </path-tree-view-entry>
    </path-tree-view>
  </div>
</template>

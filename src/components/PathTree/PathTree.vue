<script setup>
import { onBeforeMount, computed, ref, watch } from 'vue'
import { flatten, filter, get, identity, includes, noop, trim, trimEnd, uniq, uniqueId, uniqBy, last } from 'lodash'
import { get as makeGet } from 'lodash/fp'
import bodybuilder from 'bodybuilder'

import PathTreeView from '@/components/PathTree/PathTreeView/PathTreeView'
import PathTreeViewEntry from '@/components/PathTree/PathTreeView/PathTreeViewEntry'
import PathTreeViewEntryMore from '@/components/PathTree/PathTreeView/PathTreeViewEntryMore'
import { useCore } from '@/composables/core'
import { wildcardRegExpPattern, iwildcardMatch } from '@/utils/strings'

const query = defineModel('query', { type: String })
const selectedPaths = defineModel('selectedPaths', { type: Array, default: () => [] })
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
    default: () => {
      return ['local-datashare']
    }
  },
  /**
   * Root path of the tree
   */
  path: { type: String },
  /**
   * Deactivate the header label
   */
  noLabel: { type: Boolean, default: false },
  /**
   * Deactivate the search input
   */
  noSearch: { type: Boolean },
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
  sortByOrder: {
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
  level: { type: Number, default: 0 }
})

const { core, wait } = useCore()
const pathSeparator = computed(() => {
  return core.config.get('pathSeparator', '/')
})

const pages = ref([])
const tree = ref({ contents: [] })
const notCollapsed = ref([])
const loaderId = uniqueId()
const perPage = 50

const isCollapsedDirectory = (directory) => {
  return !notCollapsed.value.includes(directory)
}

const collapseDirectory = (directory) => {
  if (isCollapsedDirectory(directory)) {
    notCollapsed.value.push(directory)
  } else {
    notCollapsed.value.splice(notCollapsed.value.indexOf(directory), 1)
  }
}

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
  return { [props.sortBy]: props.sortByOrder }
})
const hasQuery = computed(() => {
  return query.value && trim(query.value)
})
const wildcardQuery = computed(() => {
  return hasQuery.value ? '*' + trim(query.value, '*') + '*' : '*'
})
const wildcardPath = computed(() => {
  return [props.path, wildcardQuery.value].join(pathSeparator.value)
})
const usesWindowsSeparator = computed(() => {
  return pathSeparator.value === '\\'
})

watch(query, () => loadDataWithSpinner({ clearPages: true }))
watch(order, () => loadDataWithSpinner({ clearPages: true }))
watch(makeGet(props, 'path'), () => loadDataWithSpinner({ clearPages: true }))

/**
 * Since 9.4.2, the dirname field is tokenized using the
 * "lowercase" filter. To ensure retro-compatibility, we apply lookup for
 * the path in both lowercase and original value for this field (if they
 * are different).
 */
const getPathTokens = (path) => {
  return uniq([path, path.toLowerCase()])
}

const pathTokens = computed(() => {
  return getPathTokens(props.path)
})

const queryPathTokens = computed(() => {
  return getPathTokens(wildcardPath.value)
})

const subPathTokens = computed(() => {
  return pathTokens.value.map((token) => {
    return [token, '.*', '.*'].join(pathSeparator.value)
  })
})

const normalizePath = (path) => {
  return usesWindowsSeparator.value ? path.split('\\').join('\\\\') : path
}

const createRegexOption = (tokens) => {
  return tokens.map((pattern) => `(${pattern})`).join('|')
}

const includeOption = computed(() => {
  // Convert the path with a wildcard to regex
  return createRegexOption(queryPathTokens.value.map(wildcardRegExpPattern))
})

const excludeOption = computed(() => {
  return createRegexOption(subPathTokens.value.map(normalizePath))
})

const aggregationOptions = computed(() => {
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
  return filter(tree.value.contents, { type: 'directory' })
})

const treeAsPagesBuckets = computed(() => {
  return (
    treeChildren.value
      // Only keep directories
      .filter(({ type }) => {
        return type === 'directory'
      })
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
        return { key, size: 0, doc_count: 0, directories: 0 }
      })
  )
})

const directories = computed(() => {
  const buckets = flatten(pages.value.map((p) => get(p, 'aggregations.dirname.buckets', [])))
  const allDirectories = uniqBy([...buckets, ...treeAsPagesBuckets.value], 'key')
  return props.hideEmpty ? allDirectories.filter((dir) => dir.doc_count > 0) : allDirectories
})

const toDirectory = (path) => {
  return trimEnd(path, pathSeparator.value) + pathSeparator.value
}

const isSelectedDirectory = (directory) => {
  return selectedPaths.value.map(toDirectory).includes(toDirectory(directory))
}

const hasSelectedChildDirectory = (directory) => {
  return selectedPaths.value.some((path) => {
    return toDirectory(path).startsWith(toDirectory(directory)) && !isSelectedDirectory(directory)
  })
}

const selectDirectory = (directory) => {
  const dir = toDirectory(directory)
  if (isSelectedDirectory(directory)) {
    selectedPaths.value.splice(selectedPaths.value.indexOf(dir), 1)
  } else if (props.multiple) {
    selectedPaths.value.push(dir)
  } else {
    selectedPaths.value.splice(0, selectedPaths.value.length, dir)
  }
}

const getBasename = (value) => {
  return last(value.split(pathSeparator.value))
}

const bodybuilderBase = ({ from = 0, size = 100 } = {}) => {
  const body = bodybuilder().size(0).rawOption('track_total_hits', true)
  // Only the extraction level is an optional query
  if (!props.includeChildrenDocuments) {
    body.andQuery('match', 'extractionLevel', 0)
  }
  return body
    .andQuery('terms', 'dirname.tree', pathTokens.value)
    .andQuery('match', 'type', 'Document')
    .agg('terms', 'dirname.tree', aggregationOptions.value, 'dirname', (b) => {
      return b
        .agg('sum', 'contentLength', 'size')
        .agg('bucket_sort', { size, from }, 'bucket_truncate')
        .agg('cardinality', 'dirname.tree', 'directories')
    })
    .agg('sum', 'contentLength', 'total_size')
    .agg('cardinality', 'dirname.tree', 'total_directories')
}

const loadData = async ({ clearPages = false } = {}) => {
  const index = props.projects.join(',')
  const from = clearPages ? 0 : offset.value
  const size = perPage
  const body = props.preBodyBuild(bodybuilderBase({ from, size })).build()
  const preference = 'tree-view-paths'
  const res = await core.api.elasticsearch.search({ index, body, preference, size: 0 })
  // Clear the list of pages (to start over!)
  if (clearPages) await clearPagesAndLoadTree()
  // Add the result as a page
  pages.value.push(res)
}

const loadDataWithSpinner = async (...args) => {
  try {
    wait.start(loaderId)
    await loadData(...args)
  } finally {
    wait.end(loaderId)
  }
}

const nextLoadData = async ($infiniteLoadingState) => {
  await loadData()
  // Did we reach the end?
  const method = reachedTheEnd.value ? 'complete' : 'loaded'
  // Call the right method (with "noop" as safety net in case the method can't be found)
  return get($infiniteLoadingState, method, noop)()
}

const clearPages = () => {
  return pages.value.splice(0, pages.value.length)
}

const loadTree = async () => {
  try {
    tree.value = await core.api.tree(props.path)
  } catch {
    tree.value = { contents: [] }
  }
}

const clearPagesAndLoadTree = async () => {
  clearPages()
  // Only load the tree if we clear out the pages
  // and entirely load the folder. This way we avoid
  // load directories from the /tree API when they are
  // already present in next result page of the
  // ElasticSearch aggregation.
  //
  // The /tree API is disabled in server so we ensure
  // the mode is correct before running it.
  if (reachedTheEnd.value && core.config.get('mode') !== 'SERVER') {
    await loadTree()
  }
}

const totalDocuments = computed(() => {
  return get(lastPage.value, 'hits.total.value', 0)
})

const totalDirectories = computed(() => {
  return get(lastPage.value, 'aggregations.total_directories.value', -1)
})

const totalSize = computed(() => {
  return get(lastPage.value, 'aggregations.total_size.value', -1)
})

onBeforeMount(() => {
  return loadDataWithSpinner({ clearPages: true })
})

defineExpose({ loadData, loadDataWithSpinner })
</script>

<template>
  <div class="path-tree">
    <path-tree-view
      v-model:query="query"
      :no-label="noLabel"
      :no-search="noSearch"
      :select-mode="selectMode"
      :multiple="multiple"
    >
      <path-tree-view-entry
        :loading="wait.is(loaderId)"
        :name="getBasename(path)"
        :selected="isSelectedDirectory(path)"
        :documents="totalDocuments"
        :directories="totalDirectories"
        :size="totalSize"
        :collapse="false"
        :indeterminate="hasSelectedChildDirectory(path)"
        :no-header="level > 0"
        @update:selected="selectDirectory(path)"
      >
        <path-tree-view-entry
          v-for="directory in directories"
          :key="directory"
          :name="getBasename(directory.key)"
          :documents="directory.doc_count"
          :directories="directory.directories.value"
          :size="directory.size.value"
          :selected="isSelectedDirectory(directory.key)"
          :collapse="isCollapsedDirectory(directory.key)"
          :indeterminate="hasSelectedChildDirectory(directory.key)"
          @update:selected="selectDirectory(directory.key)"
          @update:collapse="collapseDirectory(directory.key)"
        >
          <template #default="{ collapse }">
            <path-tree
              v-if="!collapse"
              v-model:selected-paths="selectedPaths"
              no-label
              no-search
              :level="level + 1"
              :path="directory.key"
              :projects="projects"
              :select-mode="selectMode"
              :multiple="multiple"
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

// The path tree can be visualized in three different layouts:
//
// - TREE : hierarchical display of nested directories and files.
const TREE = 'tree'
// - LIST : flat list of entries without hierarchy.
const LIST = 'list'
// - GRID : tiled view with a preview for each directory or file.
const GRID = 'grid'
//
// Note: these layouts can overlap in behavior. For example, the TREE
// layout internally renders entries as a list, while the GRID layout
// uses list semantics but displays richer previews.

export const LAYOUTS = Object.freeze({ LIST, GRID, TREE })
export const layoutValidator = l => Object.values(LAYOUTS).includes(l)

// The path tree entries can be sorted by three possible fields:
//
// - SIZE  : total byte size of documents within a directory or file size.
const SIZE = 'size'
// - COUNT : number of items contained in a directory.
const COUNT = '_count'
// - KEY   : the directory or file name (string key).
const KEY = '_key'
//
// By default, the field depends on the data source (see SOURCES_SORT_BY).

export const SORT_BY = Object.freeze({ SIZE, COUNT, KEY })
export const sortByValidator = order => Object.values(SORT_BY).includes(order)

// Sorting can be applied in two directions:
// - ASC  : ascending (smallest → largest, A → Z).
const ASC = 'asc'
// - DESC : descending (largest → smallest, Z → A).
const DESC = 'desc'

export const ORDER_BY = Object.freeze({ ASC, DESC })
export const orderByValidator = order => Object.values(ORDER_BY).includes(order)

// The path tree can be constructed from three different sources:
//
// - SOURCE_DIRS : Elasticsearch "dirname" aggregation (returns directories with aggregated metadata).
export const SOURCE_DIRS = 'dirs'
// - SOURCE_DOCS : Elasticsearch document hits (returns individual files as indexed documents).
export const SOURCE_DOCS = 'docs'
// - SOURCE_TREE : API endpoint that enumerates the file system tree (returns a full disk-based listing).
export const SOURCE_TREE = 'tree'

// Each source supports only a subset of the sorting fields.
// The SOURCES_SORT_BY map defines which field is available for
// each source when sorting by SIZE, COUNT, or KEY:
export const SOURCES_SORT_BY = Object.freeze({
  [SIZE]: Object.freeze({
    [SOURCE_DIRS]: SIZE,
    [SOURCE_TREE]: 'size',
    [SOURCE_DOCS]: 'contentLength',
  }),
  [COUNT]: Object.freeze({
    [SOURCE_DIRS]: COUNT,
    // SOURCE_TREE does not support COUNT sorting
    [SOURCE_TREE]: 'name',
    // SOURCE_DOCS does not support COUNT sorting
    [SOURCE_DOCS]: 'path',
  }),
  [KEY]: Object.freeze({
    [SOURCE_DIRS]: KEY,
    [SOURCE_TREE]: 'name',
    [SOURCE_DOCS]: 'path',
  }),
})

/**
 * Name of the chunk every non-async component is grouped into. Shared with
 * componentCssLast, which has to find that chunk's stylesheet in the html.
 */
export const COMPONENTS_CHUNK = 'components'

/**
 * Datashare's web server speaks HTTP/1.1, so a route that pulls hundreds of
 * small chunks pays for the round trips, not for the bytes. Grouping trades
 * boot payload for request count: the components group costs about 173 kB
 * gzip on first load and takes the search route from 230 requests to 10.
 *
 * It does not defer anything, and it is not a caching win: the group is the
 * artifact that changes on every deploy. A group is downloaded on first paint
 * as soon as one member is statically reachable from the entry, so deferring
 * needs a dynamic import at the call site, not a chunk name here.
 */
export function manualChunks(id) {
  if (id.includes('commonjsHelpers')) {
    return 'vendor-framework'
  }

  // Tested before the app paths: several dependencies ship files under
  // `dist/src/components/`, bootstrap-vue-next's subpath exports among them,
  // and those must stay in their vendor chunk.
  if (!id.includes('node_modules')) {
    if (id.includes('/src/components/')) {
      // Subtrees only ever reached through a dynamic import, either a
      // `defineAsyncComponent` call or a lazy route. A grouped module
      // is downloaded as soon as any other member is, so grouping
      // these would undo their laziness and drag their dependencies
      // into the boot preload, v-calendar and the viewers included.
      const asyncOnly = [
        'Document/DocumentViewer/',
        'Widget/',
        'Filter/FilterType/',
        'Search/SearchAdvancedModal/',
        'Form/FormControl/FormControlDateRange/',
        'ColumnChartPicker'
      ]
      if (asyncOnly.some(dir => id.includes(`/src/components/${dir}`))) {
        return
      }
      return COMPONENTS_CHUNK
    }
    return
  }

  const scope = id.slice(id.lastIndexOf('node_modules/') + 'node_modules/'.length)
  const match = scope.match(/^((?:@[^/]+\/)?[^/]+)/)
  const pkg = match?.[1]
  if (!pkg) return

  // Search/ES client stack — elasticsearch-browser alone is
  // ~1.6 MB raw, the single biggest dependency in the app.
  if (['elasticsearch-browser', 'bodybuilder', 'lucene'].includes(pkg)) {
    return 'vendor-search'
  }

  // Calendar, now only reachable through FormControlDateRange.vue's
  // own import since Core.js no longer installs the plugin globally.
  if (pkg === 'v-calendar') {
    return 'vendor-calendar'
  }

  // Charting/geo. Not deferred: @icij/murmur (vendor-ui) statically
  // imports d3-geo/d3-scale, so this group is preloaded everywhere.
  if (pkg === 'd3' || pkg.startsWith('d3-') || pkg.startsWith('topojson')) {
    return 'vendor-charts'
  }

  // UI kit — bootstrap-vue-next and @icij/murmur share a large
  // amount of code and are used across nearly every view.
  if (['bootstrap-vue-next', '@icij/murmur', 'bootstrap', 'resize-observer-polyfill', 'vue-resize'].includes(pkg) || pkg.startsWith('@floating-ui')) {
    return 'vendor-ui'
  }

  // Core framework — changes rarely, needed on every route.
  if (pkg === 'vue' || pkg.startsWith('@vue/') || pkg === 'vue-router' || pkg === 'pinia' || pkg === 'vue-i18n' || pkg.startsWith('@intlify')) {
    return 'vendor-framework'
  }

  // NOTE: pdfjs-dist/@tato30/vue-pdf/image-js/tiff/jpeg-js were
  // tried as their own "vendor-viewer" chunk (document-viewer-only,
  // not needed on generic app load) but that grouping produced a
  // "Cannot access '<var>' before initialization" runtime error, a
  // circular chunk dependency between that group and other chunks.
  // Verified in a real browser (build succeeds either way; only
  // runtime testing catches this). Left ungrouped below so Rollup
  // keeps them in their existing lazy route chunks; revisit only
  // with careful cycle analysis, not a blind re-split.

  // Spreadsheet export — feature-specific, not needed app-wide.
  if (pkg === 'xlsx') {
    return 'vendor-export'
  }

  // lodash + the standalone lodash.* packages (885 kB raw,
  // duplicated logic across lodash and lodash.merge/clonedeep/unset)
  // — isolate so it caches independently of unrelated vendor code.
  if (pkg === 'lodash' || pkg.startsWith('lodash.')) {
    return 'vendor-lodash'
  }

  // Anything else keeps Rollup's default placement: lazily
  // imported deps (e.g. the markdown stack, PDF/TIFF viewers) stay
  // in their route-specific async chunks instead of being pulled
  // into a preloaded catch-all.
}

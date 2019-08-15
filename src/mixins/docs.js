import compact from 'lodash/compact'
import every from 'lodash/every'
import filter from 'lodash/filter'
import find from 'lodash/find'
import get from 'lodash/get'
import template from 'lodash/template'
import trimStart from 'lodash/trimStart'
import uniq from 'lodash/uniq'
import { join } from 'path'
import { getOS } from '@/utils/utils'

const ROUTE_DOCS_PATH = require.context('../../public/docs', true, /\.md/, 'lazy').keys()
const ROUTE_DOCS_META = ROUTE_DOCS_PATH.map(path => {
  // Remove the './' prefix
  path = join(path)
  // Import metadata for this Markdown file
  return require(`!!json-loader!metadata-loader!../../public/docs/${path}`)
})
console.log(ROUTE_DOCS_META)

export default {
  methods: {
    findRouteDocMeta (path) {
      const resourcePath = trimStart(path, '/').split('?').shift()
      return find(ROUTE_DOCS_META, { resourcePath })
    },
    isRouteDocValid (path) {
      // We use the browser's URL parser to extract config filter
      const uri = new URL(path, 'http://void/')
      // Config filters are written as search params (param=value)
      const searchParams = [...uri.searchParams.entries()]
      return every(searchParams, ([key, val]) => this.$config.get(key) === val)
    },
    parseRouteDefinition (definition) {
      const os = getOS()
      return template(definition)({ os })
    },
    flattentRouteDocsDefinitions (routes = this.$router.options.routes) {
      let definitions = []
      for (const route of routes) {
        if (route.meta && route.meta.docs) {
          definitions = definitions.concat(route.meta.docs)
        }
        if (route.children) {
          definitions = definitions.concat(this.flattentRouteDocsDefinitions(route.children))
        }
      }
      return uniq(definitions.map(this.parseRouteDefinition))
    }
  },
  computed: {
    allRouteDocs () {
      return this.flattentRouteDocsDefinitions()
    },
    validRouteDocs () {
      return filter(this.allRouteDocs, this.isRouteDocValid)
    },
    validRouteDocsMeta () {
      return this.validRouteDocs.map(this.findRouteDocMeta)
    },
    currentRouteDocs () {
      return compact(get(this, '$route.meta.docs', []).map(definition => {
        // Inject current OS in the URL
        const path = this.parseRouteDefinition(definition)
        // The route must be valid
        return this.isRouteDocValid(path) ? this.findRouteDocMeta(path) : null
      }))
    }
  }
}

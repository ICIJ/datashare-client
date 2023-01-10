import { castArray, get, filter, template, trimStart } from 'lodash'
import settings from '@/utils/settings'
import { getOS } from '@/utils/utils'

export default {
  methods: {
    parseRouteDefinition({ title: titleKey, path, ...rest }) {
      const os = getOS()
      const href = this.toDocumentationURL(template(path)({ os }))
      const title = this.$te(titleKey) ? this.$t(titleKey) : titleKey ?? path
      return { title, href, ...rest }
    },
    toDocumentationURL(path) {
      const trim = (str) => trimStart(str, '/')
      return [settings.documentationUrl, path].map(trim).join('/')
    }
  },
  computed: {
    routeDocs() {
      return get(this, '$route.meta.docs', []).map(this.parseRouteDefinition)
    },
    filteredRouteDocs() {
      const appMode = this.$config.get('mode')
      return filter(this.routeDocs, ({ mode = null }) => {
        return mode === null || castArray(mode).indexOf(appMode) > -1
      })
    }
  }
}

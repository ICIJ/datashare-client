import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import VueShortkey from 'vue-shortkey'
import VueScrollTo from 'vue-scrollto'
import router from '@/router'
import messages from '@/lang/en'
import store from '@/store'
import DatashareClient from '@/api/DatashareClient'
import settings from '@/utils/settings'

import '@/utils/font-awesome'
import '@/main.scss'

/* eslint-disable no-new */
async function createApp (LocalVue = Vue) {
  LocalVue.config.productionTip = process.env.NODE_ENV === 'development'
  LocalVue.use(BootstrapVue)
  LocalVue.use(Murmur)
  LocalVue.use(VueI18n)
  LocalVue.use(VueProgressBar, { color: settings.progressBar.color })
  LocalVue.use(VueShortkey, { prevent: settings.hotKeyPrevented })
  LocalVue.use(VueScrollTo)

  const i18n = new VueI18n({
    locale: settings.defaultLocale,
    fallbackLocale: settings.defaultLocale,
    messages: { [settings.defaultLocale]: messages }
  })
  const ds = new DatashareClient()
  // Get the config object
  const config = await ds.getConfig()
  // Murmur exposes a config attribute which share a Config object
  // with the current vue instance.
  Murmur.config.merge(config)
  Murmur.config.set('document-thumbnail.activated', !!config.previewHost)
  Murmur.config.set('document-thumbnail.host', config.previewHost)
  Murmur.config.set('content-placeholder.rows', settings.contentPlaceholder.rows)
  // Select the first user's index as default index
  store.commit('search/index', config.userIndices[0])
  store.commit('batchSearch/index', config.userIndices[0])
  // Render function returns a router-view component by default
  const render = h => h('router-view')
  // Return an instance of the Vue constructor we receive.
  // We do not necessarily use the default Vue so we can use this function
  // from our unit tests
  return new LocalVue({ i18n, router, store, render }).$mount('#app')
}

if (process.env.NODE_ENV !== 'test') {
  createApp()
}

export { createApp }

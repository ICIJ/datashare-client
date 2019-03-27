import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'

import router from '@/router'
import messages from '@/lang/en'
import store from '@/store'
import DatashareClient from '@/api/DatashareClient'

import '@/utils/font-awesome'
import '@/main.scss'

/* eslint-disable no-new */
async function createApp (LocalVue = Vue) {
  LocalVue.config.productionTip = process.env.NODE_ENV === 'development'
  LocalVue.use(VueI18n)
  LocalVue.use(VueProgressBar, { color: '#852308' })
  LocalVue.use(BootstrapVue)
  LocalVue.use(Murmur)

  const i18n = new VueI18n({ locale: 'en', fallbackLocale: 'en', messages: { 'en': messages } })
  const ds = new DatashareClient()
  // Get the config object
  const config = await ds.getConfig().then(res => res.json())
  // Murmur expores a config attribute which share a Config object
  // with the current vue instance.
  Murmur.config.merge(config)
  Murmur.config.set('document-thumbnail.activated', !!process.env.VUE_APP_DS_PREVIEW_HOST)
  Murmur.config.set('content-placeholder.rows', [
    {
      height: '1em',
      boxes: [[0, '5em']]
    },
    {
      height: '1em',
      boxes: [[0, '5em'], ['1em', '60%']]
    },
    {
      height: '1em',
      boxes: [[0, '5em']]
    },
    {
      height: '1em',
      boxes: [[0, '5em'], ['1em', '40%']]
    },
    {
      height: '1em',
      boxes: [[0, '5em']]
    }
  ])
  // Select the first user's index as default index
  store.commit('search/index', config.userIndices[0])
  // Render function returns a router-view component by default
  const render = h => h('router-view')
  // Return an instance of the Vue construtor we receive.
  // We do not necessarily use the default Vue so we can use this function
  // from our unit tests
  return new LocalVue({ i18n, router, store, render }).$mount('#app')
}

if (process.env.NODE_ENV !== 'test') {
  createApp()
}

export { createApp }

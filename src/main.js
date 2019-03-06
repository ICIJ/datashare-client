import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'

import router from '@/router'
import messages from '@/lang/en'
import store from '@/store'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import DatashareClient from '@/api/DatashareClient'

import '@/main.scss'

Vue.config.productionTip = false
Vue.use(VueI18n)
Vue.use(VueProgressBar, { color: '#852308' })
Vue.use(BootstrapVue)
Vue.use(Murmur)
// Font Awesome component must be available everywhere
Vue.component('font-awesome-icon', FontAwesomeIcon)

const i18n = new VueI18n({ locale: 'en', fallbackLocale: 'en', messages: { 'en': messages } })
let vm = null

/* eslint-disable no-new */
async function createApp (LocalVue = Vue) {
  const ds = new DatashareClient()
  // Get the config object
  const config = await ds.getConfig().then(res => res.json())
  // Murmur expores a config attribute which share a Config object
  // with the current vue instance.
  Murmur.config.merge(config)
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

export { vm, createApp }

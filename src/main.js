import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'
import BootstrapVue from 'bootstrap-vue'
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
// Font Awesome component must be available everywhere
Vue.component('font-awesome-icon', FontAwesomeIcon)

const i18n = new VueI18n({ locale: 'en', fallbackLocale: 'en', messages: { 'en': messages } })
let vm = null

/* eslint-disable no-new */
async function createApp () {
  const ds = new DatashareClient()
  return ds.getConfig().then(res => {
    return res.json().then(config => {
      Vue.prototype.config = config
      store.commit('search/index', config.userIndices[0])
      vm = new Vue({
        i18n,
        router,
        store,
        render: h => h('router-view')
      }).$mount('#app')
    })
  })
}

if (process.env.NODE_ENV !== 'test') {
  createApp()
}

export { vm, createApp }

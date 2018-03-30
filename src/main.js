import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'

import router from './router'
import messages from './messages'
import store from './store'
import FontAwesomeIcon from './components/FontAwesomeIcon'
import ContentPlaceholder from './components/ContentPlaceholder'

import '@/main.scss'

Vue.use(VueI18n)
Vue.use(VueProgressBar, { color: '#852308' })
// Font Awesome component must be available everywhere
Vue.component('font-awesome-icon', FontAwesomeIcon)
// ContentPlaceholder to display when content loading
Vue.component('content-placeholder', ContentPlaceholder)

Vue.config.productionTip = false

const i18n = new VueI18n({locale: 'en', fallbackLocale: 'en', messages})

/* eslint-disable no-new */
new Vue({
  i18n,
  router,
  store,
  el: '#app',
  template: '<router-view></router-view>'
})

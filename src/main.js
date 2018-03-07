import Vue from 'vue'
import VueI18n from 'vue-i18n'
import 'es6-promise/auto'

import router from './router'
import messages from './messages'
import App from './components/App'
import FontAwesomeIcon from './components/FontAwesomeIcon'


import '@/main.scss'

Vue.use(VueI18n)
// Font Awesome component must be available everywhere
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

const i18n = new VueI18n({locale: 'en', fallbackLocale: 'en', messages})

/* eslint-disable no-new */
new Vue({
  i18n,
  el: '#app',
  router,
  components: { App },
  template: '<router-view></router-view>'
})

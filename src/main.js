import Vue from 'vue'
import VueI18n from 'vue-i18n'

import router from './router'
import messages from './messages'
import App from './components/App'

import '@/main.scss'

Vue.use(VueI18n)
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

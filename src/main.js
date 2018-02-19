import Vue from 'vue'
import VueI18n from 'vue-i18n'
import App from './App'
import router from './router'
import messages from './messages'

Vue.use(VueI18n)
Vue.config.productionTip = false

const i18n = new VueI18n({locale: 'en', messages})

/* eslint-disable no-new */
new Vue({
  i18n,
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

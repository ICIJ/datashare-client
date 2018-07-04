import messages from '@/messages'
import router from '@/router'
import store from '@/store'

import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import ContentPlaceholder from '@/components/ContentPlaceholder'
import App from '@/components/App'

Vue.use(VueI18n)
Vue.use(VueProgressBar, { color: '#852308' })
// Font Awesome component must be available everywhere
Vue.component('font-awesome-icon', FontAwesomeIcon)
// ContentPlaceholder to display when content loading
Vue.component('content-placeholder', ContentPlaceholder)

const i18n = new VueI18n({ locale: 'en', messages })

describe('App.vue', () => {
  let vm = null
  let Constructor = null

  beforeEach(async () => {
    Constructor = Vue.extend(App)
    vm = new Constructor({ i18n, router, store }).$mount()
  })

  it('should display search bar', () => {
    expect(vm.$el.querySelector('form.search-bar button').textContent).to.equal('Search')
  })

  it('should display search bar in french', () => {
    vm = new Constructor({store, router, i18n: new VueI18n({locale: 'fr', messages})}).$mount()
    expect(vm.$el.querySelector('form.search-bar button').textContent).to.equal('Rechercher')
  })
})

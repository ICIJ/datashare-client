import Vue from 'vue'
import VueI18n from 'vue-i18n'
import 'es6-promise/auto'

import messages from '@/messages'
import router from '@/router'
import store from '@/store'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import App from '@/components/App'

Vue.use(VueI18n)

const i18n = new VueI18n({locale: 'en', messages})
Vue.component('font-awesome-icon', FontAwesomeIcon)

describe('App.vue', () => {
  it('should display search bar', () => {
    const Constructor = Vue.extend(App)

    const vm = new Constructor({i18n, router, store}).$mount()

    expect(vm.$el.querySelector('form.search-bar button').textContent).to.equal('Search')
  })

  it('should display search bar in french', () => {
    const Constructor = Vue.extend(App)

    const vm = new Constructor({store, router, i18n: new VueI18n({locale: 'fr', messages})}).$mount()

    expect(vm.$el.querySelector('form.search-bar button').textContent).to.equal('Rechercher')
  })
})

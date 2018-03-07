import Vue from 'vue'
import VueI18n from 'vue-i18n'
import 'es6-promise/auto'

import messages from '@/messages'
import router from '@/router'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import App from '@/components/App'

Vue.use(VueI18n)

const i18n = new VueI18n({locale: 'en', messages})
// Font Awesome component must be available everywhere
Vue.component('font-awesome-icon', FontAwesomeIcon)

describe('App.vue', () => {
  it('should display search bar', () => {
    const Constructor = Vue.extend(App)

    const vm = new Constructor({i18n, router}).$mount()

    expect(vm.$el.querySelector('div.search button').textContent).to.equal('Search')
  })

  it('should display search bar in french', () => {
    const Constructor = Vue.extend(App)

    const vm = new Constructor({router, i18n: new VueI18n({locale: 'fr', messages})}).$mount()

    expect(vm.$el.querySelector('div.search button').textContent).to.equal('Rechercher')
  })
})

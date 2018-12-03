import messages from '@/messages'
import router from '@/router'
import store from '@/store'

import { createLocalVue, mount } from '@vue/test-utils'
import VueI18n from 'vue-i18n'
import Vuex from 'vuex'
import VueProgressBar from 'vue-progressbar'
import BootstrapVue from 'bootstrap-vue'
import trim from 'lodash/trim'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import App from '@/components/App'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Vuex)
localVue.use(BootstrapVue)
localVue.use(VueProgressBar, { color: '#852308' })
localVue.component('font-awesome-icon', FontAwesomeIcon)

describe('App.vue', () => {
  beforeAll(() => {
    let settingsButton = document.createElement('button')
    settingsButton.setAttribute('id', 'toggleSettings')
    document.body.appendChild(settingsButton)
  })

  it('should display search bar', () => {
    const i18n = new VueI18n({ locale: 'en', messages })
    const wrapped = mount(App, { localVue, i18n, router, store })
    expect(trim(wrapped.vm.$el.querySelector('form.search-bar button[type=submit]').textContent)).toEqual('Search')
  })

  it('should display search bar in french', () => {
    const i18n = new VueI18n({ locale: 'fr', messages })
    const wrapped = mount(App, { localVue, i18n, router, store })
    expect(trim(wrapped.vm.$el.querySelector('form.search-bar button[type=submit]').textContent)).toEqual('Rechercher')
  })
})

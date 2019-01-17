import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import AppNav from '@/components/AppNav'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import messages from '@/messages'
import router from '@/router'
import store from '@/store'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(BootstrapVue)
localVue.component('font-awesome-icon', FontAwesomeIcon)
const i18n = new VueI18n({ locale: 'en', messages })

describe('AppNav.vue', () => {
  let wrapped = null

  beforeEach(async () => {
    wrapped = shallowMount(AppNav, { localVue, i18n, router, store })
  })

  it('should display a menu', async () => {
    expect(wrapped.find('.app__nav__container__main__menu').exists()).toBeTruthy()
    expect(wrapped.findAll('.app__nav__container__main__menu__item').length).toEqual(6)
  })
})

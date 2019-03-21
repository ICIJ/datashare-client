import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import { createLocalVue, mount } from '@vue/test-utils'

import Murmur from '@icij/murmur'
import ProjectCards from '@/components/ProjectCards'
import router from '@/router'
import store from '@/store'
import messages from '@/lang/en'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(Vuex)
localVue.use(BootstrapVue)

const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('ProjectCards.vue', () => {
  it('should display one card for first-index', async () => {
    Murmur.config.merge({ userIndices: ['first-index'] })
    const wrapper = mount(ProjectCards, { localVue, i18n, router, store })
    expect(wrapper.findAll('.project-cards__item').length).toEqual(1)
  })

  it('should display one card for with the index name in titlecase', async () => {
    Murmur.config.merge({ userIndices: ['first-index'] })
    const wrapper = mount(ProjectCards, { localVue, i18n, router, store })
    expect(wrapper.find('.project-cards__item__body').text()).toEqual('First Index')
  })

  it('should display two cards', async () => {
    Murmur.config.merge({ userIndices: ['first-index', 'second-index'] })
    const wrapper = mount(ProjectCards, { localVue, i18n, router, store })
    expect(wrapper.findAll('.project-cards__item').length).toEqual(2)
  })
})

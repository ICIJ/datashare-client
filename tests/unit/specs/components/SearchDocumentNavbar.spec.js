import SearchDocumentNavbar from '@/components/SearchDocumentNavbar'
import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import { createLocalVue, mount } from '@vue/test-utils'
import messages from '@/lang/en'
import router from '@/router'
import store from '@/store'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('SearchDocumentNavbar.vue', () => {
  it('should display a `Back to the search results` link', () => {
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
    const wrapper = mount(SearchDocumentNavbar, { localVue, i18n, router, store })

    expect(wrapper.findAll('.search-document-navbar')).toHaveLength(1)
    expect(wrapper.find('.search-document-navbar .search-document-navbar__back').attributes('href')).toEqual(`#/?q=&from=0&size=25&sort=relevance&index=${process.env.VUE_APP_ES_INDEX}`)
  })
})

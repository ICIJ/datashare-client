import Vue from 'vue'
import VueI18n from 'vue-i18n'
import 'es6-promise/auto'

import messages from '@/messages'
import router from '@/router'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import Search from '@/components/Search'

Vue.use(VueI18n)

const i18n = new VueI18n({locale: 'en', messages})
Vue.component('font-awesome-icon', FontAwesomeIcon)

describe('Search.vue', () => {
  it('should display no document found', () => {
    const Constructor = Vue.extend(Search)

    const vm = new Constructor({i18n, router}).$mount()
    var p = vm.search('foo')

    // TODO this test is green and should'nt
    p.then(() => {
      expect(vm.$el.querySelector('.search-results h3')).to.equal('No document found for "foo"')
    }, error => {
      expect.fail(error.message)
    })
  })
})

import Vue from 'vue'
import VueI18n from 'vue-i18n'
import {createLocalVue, mount} from 'vue-test-utils'

import messages from '@/messages'
import router from '@/router'
import store from '@/store'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import DocumentView from '@/components/DocumentView'
import Document from '@/api/Document'

Vue.use(VueI18n)
const i18n = new VueI18n({locale: 'en', messages})
Vue.component('font-awesome-icon', FontAwesomeIcon)

describe('DocumentView.vue', () => {
  var wrapped = null
  beforeEach(async () => {
    const localVue = createLocalVue()
    localVue.use(VueI18n)
    wrapped = mount(DocumentView, {i18n, router, store})
  })

  it('should display a document', async () => {
    wrapped.vm.setDoc(null, new Document({_id: 'id', _source: {path: 'path/to/doc.pdf', metadata: {}}}))
    await Vue.nextTick()
    expect(wrapped.vm.$el.querySelector('h3').textContent).to.equal('doc.pdf')
    expect(wrapped.vm.$el.querySelectorAll('dd')[2].textContent).to.equal('id')
  })
})

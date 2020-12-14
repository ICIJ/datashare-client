import { createLocalVue, shallowMount } from '@vue/test-utils'

import ContentTextLengthWarning from '@/components/ContentTextLengthWarning'
import { Core } from '@/core'

describe('ContentTextLengthWarning.vue', () => {
  const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()
  const _source = { content: 'a content not realy long but mocked', contentTextLength: 2e4 }
  let wrapper = null

  beforeEach(() => {
    store.commit('document/doc', { _id: 'foo', _index: 'bar', _source })
    wrapper = shallowMount(ContentTextLengthWarning, { i18n, localVue, store })
  })

  it('should emit an event when clicking on the "open" button', async () => {
    expect(wrapper.emitted().ignore).toBeUndefined()
    wrapper.find('.content-text-length-warning__body__button').trigger('click')
    expect(wrapper.emitted().ignore).toBeDefined()
  })

  it('should change when clicking on the "open" button', async () => {
    expect(store.state.document.showContentTextLengthWarning).toBeTruthy()
    wrapper.find('.content-text-length-warning__body__button').trigger('click')
    expect(store.state.document.showContentTextLengthWarning).toBeFalsy()
  })
})

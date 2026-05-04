import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentViewUserActions from '@/views/Document/DocumentView/DocumentViewUserActions'
import { useDocumentStore } from '@/store/modules'

const fetchAllTagsByIndex = vi.fn().mockResolvedValue([])

vi.mock('@/composables/useElasticSearchQuery', () => ({
  useElasticSearchQuery: () => ({ fetchAllTagsByIndex })
}))

vi.mock('@/composables/useElementObserver', () => ({
  useElementObserver: () => ({ waitForElementCreated: vi.fn().mockResolvedValue(null) })
}))

describe('DocumentViewUserActions', () => {
  let plugins, documentStore

  beforeEach(() => {
    fetchAllTagsByIndex.mockClear()
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
    documentStore = useDocumentStore()
    vi.spyOn(documentStore, 'addTags').mockResolvedValue()
    vi.spyOn(documentStore, 'deleteTag').mockResolvedValue()
    documentStore.setDocument({ _id: 'doc1', _index: 'test-index' })
  })

  it('adds new labels to allTags after the store call completes', async () => {
    const wrapper = shallowMount(DocumentViewUserActions, {
      global: { plugins }
    })

    await wrapper.vm.addTags(['brand-new-tag'])
    await flushPromises()

    expect(wrapper.vm.allTags.some(t => t.label === 'brand-new-tag')).toBe(true)
  })

  it('does not add duplicate labels to allTags', async () => {
    const wrapper = shallowMount(DocumentViewUserActions, {
      global: { plugins }
    })

    wrapper.vm.allTags = [{ label: 'existing-tag' }]
    await wrapper.vm.addTags(['existing-tag'])
    await flushPromises()

    expect(wrapper.vm.allTags.filter(t => t.label === 'existing-tag').length).toBe(1)
  })

  it('does not add a label to allTags when it already exists with different casing', async () => {
    const wrapper = shallowMount(DocumentViewUserActions, {
      global: { plugins }
    })

    wrapper.vm.allTags = [{ label: 'existing-tag' }]
    await wrapper.vm.addTags(['EXISTING-TAG'])
    await flushPromises()

    expect(wrapper.vm.allTags.length).toBe(1)
  })

  it('does not refresh allTags after deleting a tag', async () => {
    const wrapper = shallowMount(DocumentViewUserActions, {
      global: { plugins }
    })

    fetchAllTagsByIndex.mockClear()
    await wrapper.vm.deleteTag('old-tag')
    await flushPromises()

    expect(fetchAllTagsByIndex).not.toHaveBeenCalled()
  })

  it('calls fetchAllTagsByIndex immediately on mount when document is set', async () => {
    shallowMount(DocumentViewUserActions, {
      global: { plugins }
    })

    await flushPromises()

    expect(fetchAllTagsByIndex).toHaveBeenCalledWith('test-index')
  })

  it('does not add labels to allTags when the store call fails', async () => {
    vi.spyOn(documentStore, 'addTags').mockRejectedValue(new Error('network error'))

    const wrapper = shallowMount(DocumentViewUserActions, {
      global: { plugins }
    })

    await wrapper.vm.addTags(['failed-tag'])
    await flushPromises()

    expect(wrapper.vm.allTags.some(t => t.label === 'failed-tag')).toBe(false)
  })
})

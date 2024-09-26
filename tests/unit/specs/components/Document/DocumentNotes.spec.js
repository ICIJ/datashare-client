import { flushPromises, shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentNotes from '@/components/Document/DocumentNotes'

describe('DocumentNotes.vue', () => {
  let wrapper, plugins, api, store
  const path = '/this/is/a/'
  const project = 'banana-papers'
  const note1 = { note: 'This is a note', project, path: '/this/is/a/', variant: 'warning' }
  const note2 = { note: 'This is a second note', project, path: '/this/is/', variant: 'error' }
  beforeAll(() => {
    api = { retrieveNotes: vi.fn() }
    const core = CoreSetup.init(api).useAll()

    plugins = core.plugins
    store = core.store
    store.commit('search/index', project)
  })
  beforeEach(() => {
    store.state.documentNotes.notes = {}
  })

  it('should NOT display note on document', () => {
    wrapper = shallowMount(DocumentNotes, { global: { plugins } })
    expect(wrapper.find('b-alert-stub').exists()).toBeFalsy()
  })

  it('should display note on document', async () => {
    const notes = [note1]
    api.retrieveNotes.mockResolvedValue(notes)
    wrapper = shallowMount(DocumentNotes, { global: { plugins }, props: { path } })
    await flushPromises()
    expect(wrapper.find('b-alert-stub').exists()).toBeTruthy()
  })

  it('should display 2 notes on document', async () => {
    const notes = [note1, note2]
    api.retrieveNotes.mockResolvedValue(notes)
    wrapper = shallowMount(DocumentNotes, { global: { plugins }, props: { path } })
    await flushPromises()
    expect(wrapper.findAll('b-alert-stub')).toHaveLength(2)
  })

  it('should display note on document with default variant: warning', async () => {
    const noteNoVariant = { note: 'This is note without variant', project, path: '/this/is/a/' }

    const notes = [noteNoVariant]
    api.retrieveNotes.mockResolvedValue(notes)
    wrapper = shallowMount(DocumentNotes, { global: { plugins }, props: { path } })
    await flushPromises()
    expect(wrapper.find('b-alert-stub').exists()).toBeTruthy()
    expect(wrapper.find('b-alert-stub').attributes('variant')).toBe('warning')
  })
})

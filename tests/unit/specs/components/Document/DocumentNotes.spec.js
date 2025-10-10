import { flushPromises, shallowMount } from '@vue/test-utils'
import { beforeAll } from 'vitest'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentNotes from '@/components/Document/DocumentNotes'
import { useDocumentStore, useDocumentNotesStore, useSearchStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()

  return {
    apiInstance: {
      ...apiInstance,
      retrieveNotes: vi.fn().mockResolvedValue([])
    }
  }
})

describe('DocumentNotes.vue', () => {
  const path = '/this/is/a/'
  const project = 'banana-papers'
  const document = { path, project }
  const note1 = { note: 'This is a note', project, path: '/this/is/a/', variant: 'warning' }
  const note2 = { note: 'This is a second note', project, path: '/this/is/', variant: 'error' }

  let core, wrapper, plugins, documentStore, documentNotesStore, searchStore

  beforeAll(() => {
    api.retrieveNotes.mockResolvedValue([])
  })

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    plugins = core.plugins
    searchStore = useSearchStore()
    searchStore.setIndex(project)
    documentNotesStore = useDocumentNotesStore()
    documentNotesStore.reset()
    documentStore = useDocumentStore()
    documentStore.setDocument({ _id: 'foo', _index: 'bar' })
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should NOT display note on document', () => {
    wrapper = shallowMount(DocumentNotes, { global: { plugins }, props: { document } })
    expect(wrapper.find('b-alert-stub').exists()).toBeFalsy()
  })

  it('should display note on document', async () => {
    const notes = [note1]
    api.retrieveNotes.mockResolvedValue(notes)
    wrapper = shallowMount(DocumentNotes, { global: { plugins }, props: { document } })
    await flushPromises()
    expect(wrapper.find('b-alert-stub').exists()).toBeTruthy()
  })

  it('should display 2 notes on document', async () => {
    const notes = [note1, note2]
    api.retrieveNotes.mockResolvedValue(notes)
    wrapper = shallowMount(DocumentNotes, { global: { plugins }, props: { document } })
    await flushPromises()
    expect(wrapper.findAll('b-alert-stub')).toHaveLength(2)
  })

  it('should display note on document with default variant: warning', async () => {
    const noteNoVariant = { note: 'This is note without variant', project, path: '/this/is/a/' }

    const notes = [noteNoVariant]
    api.retrieveNotes.mockResolvedValue(notes)
    wrapper = shallowMount(DocumentNotes, { global: { plugins }, props: { document } })
    await flushPromises()
    expect(wrapper.find('b-alert-stub').exists()).toBeTruthy()
    expect(wrapper.find('b-alert-stub').attributes('variant')).toBe('warning')
  })
})

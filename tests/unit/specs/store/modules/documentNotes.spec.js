import { setActivePinia, createPinia } from 'pinia'

import { useDocumentNotes } from '@/store/modules/documentNotes'

describe('DocumentNotesStore', () => {
  const project = 'projectName'
  let store, api

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    api = { retrieveNotes: vi.fn().mockResolvedValue([]) }
    store = useDocumentNotes(api)
  })

  it('should call the retrieveNotes url', async () => {
    await store.fetchNotesOnce({ project })

    expect(api.retrieveNotes).toBeCalledTimes(1)
    expect(api.retrieveNotes).toBeCalledWith(project)
  })

  it('should call the API endpoint only once', async () => {
    await store.fetchNotesOnce({ project })
    await store.fetchNotesOnce({ project })

    expect(api.retrieveNotes).toBeCalledTimes(1)
    expect(api.retrieveNotes).toBeCalledWith(project)
  })

  it('should filter on document path', async () => {
    const note = 'note'
    const variant = 'variant'
    store.set({
      project,
      notes: [
        { note, project, variant, path: '/this/is/a/' },
        { note, project, variant, path: '/this/is/a/path/to' },
        { note, project, variant, path: '/this/is/a/path/to/document.txt' },
        { note, project, variant, path: '/this/is/another/path' }
      ]
    })

    const notes = await store.fetchNotesByPath({
      project,
      path: '/this/is/a/path/to/document.txt'
    })

    expect(notes).toHaveLength(3)
  })
})

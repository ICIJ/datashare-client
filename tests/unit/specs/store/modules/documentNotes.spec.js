import axios from 'axios'

import Api from '@/api'
import store from '@/store'

jest.mock('axios')

describe('DocumentNotesStore', () => {
  const project = 'projectName'
  beforeAll(() => axios.request.mockResolvedValue({ data: {} }))

  afterEach(() => {
    axios.request.mockClear()
    store.commit('documentNotes/reset')
  })

  it('should call the retrieveNotes url', async () => {
    await store.dispatch('documentNotes/retrieveNotes', { project })

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith({ url: Api.getFullUrl('/api/projectName/notes') })
  })

  it('should call the API endpoint only once', async () => {
    await store.dispatch('documentNotes/retrieveNotes', { project })
    await store.dispatch('documentNotes/retrieveNotes', { project })

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith({ url: Api.getFullUrl('/api/projectName/notes') })
  })

  it('should filter on document path', async () => {
    const note = 'note'
    const variant = 'variant'
    store.commit('documentNotes/setNotes', {
      project,
      notes: [
        { note, project, variant, path: '/this/is/a/' },
        { note, project, variant, path: '/this/is/a/path/to' },
        { note, project, variant, path: '/this/is/a/path/to/document.txt' },
        { note, project, variant, path: '/this/is/another/path' }
      ]
    })

    const notes = await store.dispatch('documentNotes/filterNotesByPath', { project, path: '/this/is/a/path/to/document.txt' })

    expect(notes).toHaveLength(3)
  })
})

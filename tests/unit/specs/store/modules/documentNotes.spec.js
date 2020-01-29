import axios from 'axios'

import Api from '@/api'
import store from '@/store'

jest.mock('axios')

describe('DocumentNotesStore', () => {
  beforeAll(() => axios.request.mockResolvedValue({ data: {} }))

  afterEach(() => {
    axios.request.mockClear()
    store.commit('documentNotes/reset')
  })

  it('should call the retrieveNotes url', async () => {
    await store.dispatch('documentNotes/retrieveNotes', { project: 'projectName', path: 'path' })

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith({ url: Api.getFullUrl('/api/projectName/notes/path') })
  })

  it('should call the API endpoint only once', async () => {
    await store.dispatch('documentNotes/retrieveNotes', { project: 'projectName', path: 'path' })
    await store.dispatch('documentNotes/retrieveNotes', { project: 'projectName', path: 'path' })

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith({ url: Api.getFullUrl('/api/projectName/notes/path') })
  })
})

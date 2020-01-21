import { datashare } from '@/store/modules/documentNotes'
import DatashareClient from '@/api/DatashareClient'
import { jsonResp } from 'tests/unit/tests_utils'
import store from '@/store'

describe('DocumentNotesStore', () => {
  beforeAll(() => {
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonResp())
  })

  beforeEach(() => datashare.fetch.mockClear())

  it('should call the retrieveNotes url', () => {
    store.dispatch('documentNotes/retrieveNotes', { project: 'projectName', path: 'path' })

    expect(datashare.fetch).toBeCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/projectName/notes/path'), {})
  })

  it('should call the API endpoint only once', async () => {
    await store.dispatch('documentNotes/retrieveNotes', { project: 'projectName', path: 'path' })
    await store.dispatch('documentNotes/retrieveNotes', { project: 'projectName', path: 'path' })

    expect(datashare.fetch).toBeCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/projectName/notes/path'), {})
  })
})

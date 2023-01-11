import { Api } from '@/api'
import { storeBuilder } from '@/store/storeBuilder'

describe('SettingsStore', () => {
  let api, store, mockAxiosApi
  beforeAll(() => {
    mockAxiosApi = { request: jest.fn() }
    api = new Api(mockAxiosApi, null)
    store = storeBuilder(api)
  })

  beforeEach(() => {
    mockAxiosApi.request.mockClear()
    mockAxiosApi.request.mockResolvedValue({})
  })

  it('should call the getSettings url', () => {
    store.dispatch('settings/getSettings')

    expect(mockAxiosApi.request).toBeCalledTimes(1)
    expect(mockAxiosApi.request).toBeCalledWith(
      expect.objectContaining({
        url: Api.getFullUrl('/settings')
      })
    )
  })

  it('should send the settings modifications', () => {
    store.dispatch('settings/onSubmit', { foo: 'bar' })

    expect(mockAxiosApi.request).toBeCalledTimes(1)
    expect(mockAxiosApi.request).toBeCalledWith(
      expect.objectContaining({
        url: Api.getFullUrl('/api/settings'),
        method: 'PATCH',
        data: { data: { foo: 'bar' } },
        headers: { 'Content-Type': 'application/json' }
      })
    )
  })
})

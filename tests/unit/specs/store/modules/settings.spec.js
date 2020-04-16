import Api from '@/api'
import axios from 'axios'
import store from '@/store'

jest.mock('axios')

describe('SettingsStore', () => {
  beforeAll(() => axios.request.mockResolvedValue({ data: {} }))

  beforeEach(() => axios.request.mockClear())

  it('should call the getSettings url', () => {
    store.dispatch('settings/getSettings')

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/settings')
    }))
  })

  it('should send the settings modifications', () => {
    store.dispatch('settings/onSubmit', { foo: 'bar' })

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/settings'),
      method: 'PATCH',
      data: { data: { foo: 'bar' } },
      headers: { 'Content-Type': 'application/json' }
    }))
  })
})

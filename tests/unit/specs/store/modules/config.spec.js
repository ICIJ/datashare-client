import Api from '@/api'
import axios from 'axios'
import store from '@/store'

jest.mock('axios')

describe('ConfigStore', () => {
  beforeAll(() => axios.request.mockResolvedValue({ data: {} }))

  beforeEach(() => axios.request.mockClear())

  it('should call the getConfig url', () => {
    store.dispatch('config/getConfig')

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/config')
    }))
  })

  it('should send the config modifications', () => {
    store.dispatch('config/onSubmit', { foo: 'bar' })

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/config'),
      method: 'PATCH',
      data: { data: { foo: 'bar' } },
      headers: { 'Content-Type': 'application/json' }
    }))
  })
})

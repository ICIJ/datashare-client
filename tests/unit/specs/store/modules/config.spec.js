import { datashare } from '@/store/modules/config'
import Api from '@/api'
import { jsonResp } from 'tests/unit/tests_utils'
import store from '@/store'

describe('ConfigStore', () => {
  beforeAll(() => {
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonResp())
  })

  beforeEach(() => datashare.fetch.mockClear())

  it('should call the getConfig url', () => {
    store.dispatch('config/getConfig')

    expect(datashare.fetch).toBeCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(Api.getFullUrl('/api/config'), {})
  })

  it('should send the config modifications', () => {
    store.dispatch('config/onSubmit', { foo: 'bar' })

    expect(datashare.fetch).toBeCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(Api.getFullUrl('/api/config'),
      { method: 'PATCH', body: JSON.stringify({ data: { foo: 'bar' } }), headers: { 'Content-Type': 'application/json' } })
  })
})

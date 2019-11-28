import { datashare } from '@/store/modules/config'
import DatashareClient from '@/api/DatashareClient'
import { jsonOk } from 'tests/unit/tests_utils'
import store from '@/store'

describe('Config store', () => {
  it('should call the getConfig url', () => {
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk())

    store.dispatch('config/getConfig')

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/config'), {})
  })
})

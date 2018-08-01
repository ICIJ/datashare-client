import DatashareClient from '@/api/DatashareClient'
import fetchPonyfill from 'fetch-ponyfill'
import noop from 'lodash/noop'

// JSDom has no location
// @see https://github.com/jsdom/jsdom/issues/2112
window.location.assign = noop

const { Response } = fetchPonyfill()
const ds = new DatashareClient()

describe('Datashare backend client', () => {
  beforeEach(() => {
    jest.spyOn(ds, 'fetch')
    jest.spyOn(ds, 'redirectToAuth')
  })

  it('should return backend response to createIndex', async () => {
    fetchReturns(200, {})
    let resp = await ds.createIndex()
    let json = await resp.json()
    expect(json).toEqual({})
  })

  it('should redirect to signin page if backend response to createIndex is 401', async () => {
    fetchReturns(401, {})
    await ds.createIndex()
    expect(ds.redirectToAuth).toHaveBeenCalledTimes(1)
  })
})

function fetchReturns (status, json) {
  ds.fetch.mockReturnValue(Promise.resolve(new Response(JSON.stringify(json), {
    status: status,
    headers: {
      'Content-type': 'application/json'
    }
  })))
}

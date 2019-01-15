import DatashareClient from '@/api/DatashareClient'
import { EventBus } from '@/utils/event-bus'
import fetchPonyfill from 'fetch-ponyfill'

const { Response } = fetchPonyfill()
const ds = new DatashareClient()

describe('Datashare backend client', () => {
  beforeEach(async () => {
    jest.spyOn(ds, 'fetch')
    fetchReturns(200, {})
  })

  it('should return backend response to createIndex', async () => {
    ds.createIndex().then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should emit an error if the backend response has a bad status', async () => {
    fetchReturns(42, {})
    const mockCallback = jest.fn()
    EventBus.$on('http::error', mockCallback)

    try {
      await ds.createIndex()
    } catch (err) {
      expect(err).toEqual(new Error('42 undefined'))
    }

    expect(mockCallback.mock.calls.length).toBe(1)
    expect(mockCallback.mock.calls[0][0]).toEqual(new Response(JSON.stringify({}), {status: 42, headers: {'Content-type': 'application/json'}}))
  })

  it('should return backend reponse to deleteNamedEntitiesByMentionNorm', async () => {
    ds.deleteNamedEntitiesByMentionNorm('mentionNorm').then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend reponse to getConfig', async () => {
    ds.getConfig().then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend reponse to getIndices', async () => {
    ds.getIndices().then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
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

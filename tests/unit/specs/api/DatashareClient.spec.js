import DatashareClient from '@/api/DatashareClient'
import { EventBus } from '@/utils/event-bus'
import fetchPonyfill from 'fetch-ponyfill'
import { jsonOk } from 'tests/unit/tests_utils'

const { Response } = fetchPonyfill()
const datashare = new DatashareClient()

describe('Datashare backend client', () => {
  beforeEach(() => {
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk())
  })

  it('should return backend response to index', () => {
    datashare.index({}).then(json => expect(json).toEqual({}))
  })

  it('should return backend response to findNames', () => {
    datashare.findNames('pipeline', {}).then(json => expect(json).toEqual({}))
  })

  it('should return backend response to stopPendingTasks', () => {
    datashare.stopPendingTasks().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to stopTask', () => {
    datashare.stopTask().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to deleteDoneTasks', () => {
    datashare.deleteDoneTasks().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to getTasks', () => {
    datashare.getTasks().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to createIndex', () => {
    datashare.createIndex().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to deleteAll', async () => {
    const resp = await datashare.deleteAll()
    const json = await resp.json()
    expect(json).toEqual({})
  })

  it('should return backend response to getVersion', () => {
    datashare.getVersion().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to getConfig', () => {
    datashare.getConfig().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to deleteNamedEntitiesByMentionNorm', () => {
    datashare.deleteNamedEntitiesByMentionNorm('mentionNorm').then(json => expect(json).toEqual({}))
  })

  it('should return backend response to getSource', () => {
    datashare.getSource('relativeUrl').then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend response to getStarredDocuments', () => {
    datashare.getStarredDocuments('project').then(json => expect(json).toEqual({}))
  })

  it('should return backend response to starDocument', () => {
    datashare.getStarredDocuments('project', 'documentId').then(json => expect(json).toEqual({}))
  })

  it('should return backend response to unstarDocument', () => {
    datashare.getStarredDocuments('project', 'documentId').then(json => expect(json).toEqual({}))
  })

  it('should return backend response to tagDocument', () => {
    datashare.tagDocument('project', 'documentId', 'routingId', ['tag_01']).then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend response to untagDocument', () => {
    datashare.untagDocument('project', 'documentId', 'routingId', ['tag_01']).then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend response to batchSearch', () => {
    datashare.batchSearch('project', 'name', 'description', 'csvFile').then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend response to getBatchSearches', () => {
    datashare.getBatchSearches().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to getBatchSearchResults', () => {
    datashare.getBatchSearchResults().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to deleteBatchSearches', () => {
    datashare.deleteBatchSearches().then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should emit an error if the backend response has a bad status', async () => {
    datashare.fetch.mockReturnValue(jsonOk({}, 42))
    const mockCallback = jest.fn()
    EventBus.$on('http::error', mockCallback)

    try {
      await datashare.createIndex()
    } catch (err) {
      expect(err).toEqual(new Error('42 undefined'))
    }

    expect(mockCallback.mock.calls.length).toBe(1)
    expect(mockCallback.mock.calls[0][0]).toEqual(new Response(JSON.stringify({}), { status: 42, headers: { 'Content-type': 'application/json' } }))
  })
})

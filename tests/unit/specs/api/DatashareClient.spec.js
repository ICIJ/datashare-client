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

  it('should return backend response to index', async () => {
    datashare.index({}).then(json => expect(json).toEqual({}))
  })

  it('should return backend response to findNames', async () => {
    datashare.findNames('pipeline', {}).then(json => expect(json).toEqual({}))
  })

  it('should return backend response to stopPendingTasks', async () => {
    datashare.stopPendingTasks().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to stopTask', async () => {
    datashare.stopTask().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to deleteDoneTasks', async () => {
    datashare.deleteDoneTasks().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to getTasks', async () => {
    datashare.getTasks().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to createIndex', async () => {
    datashare.createIndex().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to deleteAll', async () => {
    datashare.deleteAll().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to getVersion', async () => {
    datashare.getVersion().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to getConfig', async () => {
    datashare.getConfig().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to deleteNamedEntitiesByMentionNorm', async () => {
    datashare.deleteNamedEntitiesByMentionNorm('mentionNorm').then(json => expect(json).toEqual({}))
  })

  it('should return backend response to getSource', async () => {
    datashare.getSource('relativeUrl').then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend response to getStarredDocuments', async () => {
    datashare.getStarredDocuments('project').then(json => expect(json).toEqual({}))
  })

  it('should return backend response to starDocument', async () => {
    datashare.getStarredDocuments('project', 'documentId').then(json => expect(json).toEqual({}))
  })

  it('should return backend response to unstarDocument', async () => {
    datashare.getStarredDocuments('project', 'documentId').then(json => expect(json).toEqual({}))
  })

  it('should return backend response to tagDocument', async () => {
    datashare.tagDocument('project', 'documentId', 'routingId', ['tag_01']).then(json => expect(json).toEqual({}))
  })

  it('should return backend response to untagDocument', async () => {
    datashare.untagDocument('project', 'documentId', 'routingId', ['tag_01']).then(json => expect(json).toEqual({}))
  })

  it('should return backend response to batchSearch', async () => {
    datashare.batchSearch('project', 'name', 'description', 'csvFile').then(json => expect(json).toEqual({}))
  })

  it('should return backend response to getBatchSearches', async () => {
    datashare.getBatchSearches().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to getBatchSearchResults', async () => {
    datashare.getBatchSearchResults().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to deleteBatchSearches', async () => {
    datashare.deleteBatchSearches().then(json => expect(json).toEqual({}))
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

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
    datashare.index({}).then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend response to findNames', async () => {
    datashare.findNames('pipeline', {}).then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend response to stopPendingTasks', async () => {
    datashare.stopPendingTasks().then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend response to stopTask', async () => {
    datashare.stopTask().then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend response to deleteDoneTasks', async () => {
    datashare.deleteDoneTasks().then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend response to getTasks', async () => {
    datashare.getTasks().then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend response to createIndex', async () => {
    datashare.createIndex().then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend response to deleteAll', async () => {
    datashare.deleteAll().then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend response to getVersion', async () => {
    datashare.getVersion().then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend response to getConfig', async () => {
    datashare.getConfig().then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend response to deleteNamedEntitiesByMentionNorm', async () => {
    datashare.deleteNamedEntitiesByMentionNorm('mentionNorm').then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend response to getSource', async () => {
    datashare.getSource('relativeUrl').then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend response to getStarredDocuments', async () => {
    datashare.getStarredDocuments('project').then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend response to starDocument', async () => {
    datashare.getStarredDocuments('project', 'documentId').then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend response to unstarDocument', async () => {
    datashare.getStarredDocuments('project', 'documentId').then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend response to untagDocument', async () => {
    datashare.untagDocument('project', 'documentId', ['tag_01']).then(
      resp => resp.json().then(
        json => expect(json).toEqual({})
      )
    )
  })

  it('should return backend response to tagDocument', async () => {
    datashare.tagDocument('project', 'documentId', ['tag_01']).then(
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

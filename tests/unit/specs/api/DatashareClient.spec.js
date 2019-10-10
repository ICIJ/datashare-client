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

  it('should return backend response to stopTask', async () => {
    const resp = await datashare.stopTask()
    const json = await resp.json()
    expect(json).toEqual({})
  })

  it('should return backend response to deleteDoneTasks', () => {
    datashare.deleteDoneTasks().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to getTasks', () => {
    datashare.getTasks().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to createIndex', async () => {
    const resp = await datashare.createIndex()
    const json = await resp.json()
    expect(json).toEqual({})
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

  it('should return backend response to deleteNamedEntitiesByMentionNorm', async () => {
    const resp = await datashare.deleteNamedEntitiesByMentionNorm('mentionNorm')
    const json = await resp.json()
    expect(json).toEqual({})
  })

  it('should return backend response to getSource', async () => {
    const resp = await datashare.getSource('relativeUrl')
    const json = await resp.json()
    expect(json).toEqual({})
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

  it('should return backend response to tagDocument', async () => {
    const resp = await datashare.tagDocument('project', 'documentId', 'routingId', ['tag_01'])
    const json = await resp.json()
    expect(json).toEqual({})
  })

  it('should return backend response to untagDocument', async () => {
    const json = await (await datashare.untagDocument('project', 'documentId', 'routingId', ['tag_01'])).json()
    expect(json).toEqual({})
  })

  it('should return backend response to batchSearch', async () => {
    const name = 'name'
    const published = true
    const csvFile = 'csvFile'
    const description = 'description'
    const project = 'project'
    const fuzziness = 2
    const fileTypes = 'application/pdf text/plain'
    const paths = 'one or two paths'
    const phraseMatch = false
    const json = await (await datashare.batchSearch(name, published, csvFile, description, project, fuzziness, fileTypes, paths, phraseMatch)).json()

    const body = new FormData()
    body.append('name', name)
    body.append('description', description)
    body.append('csvFile', csvFile)
    body.append('published', published)
    body.append('fileTypes', 'application/pdf')
    body.append('fileTypes', 'text/plain')
    body.append('fuzziness', fuzziness)
    body.append('paths', 'one')
    body.append('paths', 'or')
    body.append('paths', 'two')
    body.append('paths', 'paths')
    body.append('phrase_matches', phraseMatch)
    expect(json).toEqual({})
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/batch/search/project'), { method: 'POST', body })
  })

  it('should return backend response to getBatchSearches', () => {
    datashare.getBatchSearches().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to getBatchSearchResults', () => {
    datashare.getBatchSearchResults().then(json => expect(json).toEqual({}))
  })

  it('should return backend response to deleteBatchSearches', async () => {
    const resp = await datashare.deleteBatchSearches()
    const json = await resp.json()
    expect(json).toEqual({})
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

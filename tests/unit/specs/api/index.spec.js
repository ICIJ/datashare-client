import axios from 'axios'

import Api from '@/api'
import { EventBus } from '@/utils/event-bus'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: {} })
  }
})

const api = new Api()

describe('Datashare backend client', () => {
  let json

  beforeEach(() => axios.request.mockClear())

  it('should return backend response to index', async () => {
    json = await api.index({})
    expect(json).toEqual({})
  })

  it('should return backend response to findNames', async () => {
    json = await api.findNames('pipeline', {})
    expect(json).toEqual({})
  })

  it('should return backend response to stopPendingTasks', async () => {
    json = await api.stopPendingTasks()
    expect(json).toEqual({})
  })

  it('should return backend response to stopTask', async () => {
    json = await api.stopTask()
    expect(json).toEqual({})
  })

  it('should return backend response to deleteDoneTasks', async () => {
    json = await api.deleteDoneTasks()
    expect(json).toEqual({})
  })

  it('should return backend response to getTasks', async () => {
    json = await api.getTasks()
    expect(json).toEqual({})
  })

  it('should return backend response to createProject', async () => {
    json = await api.createProject()
    expect(json).toEqual({})
  })

  it('should return backend response to deleteAll', async () => {
    json = await api.deleteAll()
    expect(json).toEqual({})
  })

  it('should return backend response to getVersion', async () => {
    json = await api.getVersion()
    expect(json).toEqual({})
  })

  it('should return backend response to getSettings', async () => {
    json = await api.getSettings()
    expect(json).toEqual({})
  })

  it('should throw a 401 if getSettings return a error', async () => {
    axios.request.mockRejectedValue({ response: { status: 401 } })
    const mockCallback = jest.fn()
    EventBus.$on('http::error', mockCallback)
    try {
      await api.getSettings()
    } catch (error) {
      expect(error.response.status).toBe(401)
    }
    expect(axios.request).toBeCalledTimes(1)
    expect(mockCallback).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith({ url: Api.getFullUrl('/settings') })

    axios.request.mockResolvedValue({ data: {} })
  })

  it('should return backend response to setSettings', async () => {
    json = await api.setSettings({})
    expect(json).toEqual({})
  })

  it('should return backend response to deleteNamedEntitiesByMentionNorm', async () => {
    json = await api.deleteNamedEntitiesByMentionNorm('mentionNorm')
    expect(json).toEqual({})
  })

  it('should return backend response to getSource', async () => {
    json = await api.getSource('relativeUrl')
    expect(json).toEqual({})
  })

  it('should return backend response to getStarredDocuments', async () => {
    json = await api.getStarredDocuments('project')
    expect(json).toEqual({})
  })

  it('should return backend response to starDocument', async () => {
    json = await api.getStarredDocuments('project', 'documentId')
    expect(json).toEqual({})
  })

  it('should return backend response to unstarDocument', async () => {
    json = await api.getStarredDocuments('project', 'documentId')
    expect(json).toEqual({})
  })

  it('should return backend response to tagDocument', async () => {
    json = await api.tagDocument('project', 'documentId', 'routingId', ['tag_01'])
    expect(json).toEqual({})
  })

  it('should return backend response to untagDocument', async () => {
    json = await api.untagDocument('project', 'documentId', 'routingId', ['tag_01'])
    expect(json).toEqual({})
  })

  it('should return backend response to batchSearch', async () => {
    const name = 'name'
    const csvFile = 'csvFile'
    const description = 'description'
    const project = 'project'
    const phraseMatch = false
    const fuzziness = 2
    const fileTypes = [{ mime: 'application/pdf' }, { mime: 'text/plain' }]
    const paths = ['one', 'or', 'two', 'paths']
    const published = true
    json = await api.batchSearch(name, csvFile, description, project, phraseMatch, fuzziness, fileTypes, paths, published)

    const data = new FormData()
    data.append('name', name)
    data.append('csvFile', csvFile)
    data.append('description', description)
    data.append('phrase_matches', phraseMatch)
    data.append('fuzziness', fuzziness)
    data.append('fileTypes', 'application/pdf')
    data.append('fileTypes', 'text/plain')
    data.append('paths', 'one')
    data.append('paths', 'or')
    data.append('paths', 'two')
    data.append('paths', 'paths')
    data.append('published', published)
    expect(json).toEqual({})
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/batch/search/project'),
      method: 'POST',
      data
    }))
  })

  it('should return backend response to getBatchSearch', async () => {
    json = await api.getBatchSearch(12)
    expect(json).toEqual({})
  })

  it('should return backend response to getBatchSearches', async () => {
    json = await api.getBatchSearches()
    expect(json).toEqual({})
  })

  it('should return backend response to getBatchSearchResults', async () => {
    json = await api.getBatchSearchResults()
    expect(json).toEqual({})
  })

  it('should return backend response to deleteBatchSearches', async () => {
    json = await api.deleteBatchSearches()
    expect(json).toEqual({})
  })

  it('should return backend response to setMarkAsRecommended', async () => {
    json = await api.setMarkAsRecommended()
    expect(json).toEqual({})
  })

  it('should return backend response to setUnmarkAsRecommended', async () => {
    json = await api.setUnmarkAsRecommended()
    expect(json).toEqual({})
  })

  it('should return backend response to getRecommendationsByDocuments', async () => {
    json = await api.getRecommendationsByDocuments()
    expect(json).toEqual({})
  })

  it('should return backend response to getRecommendationsByProject', async () => {
    json = await api.getRecommendationsByProject()
    expect(json).toEqual({})
  })

  it('should return backend response to getDocumentsRecommendedBy', async () => {
    json = await api.getDocumentsRecommendedBy()
    expect(json).toEqual({})
  })

  it('should return backend response to getNerPipelines', async () => {
    json = await api.getNerPipelines()
    expect(json).toEqual({})
  })

  it('should return backend response to createApiKey', async () => {
    json = await api.createApiKey()
    expect(json).toEqual({})
  })

  it('should emit an error if the backend response has a bad status', async () => {
    const error = new Error('Forbidden')
    axios.request.mockReturnValue(Promise.reject(error))
    const mockCallback = jest.fn()
    EventBus.$on('http::error', mockCallback)

    try {
      await api.createProject()
    } catch (err) {
      expect(err).toEqual(error)
    }

    expect(mockCallback.mock.calls).toHaveLength(1)
    expect(mockCallback.mock.calls[0][0]).toEqual(error)
  })
})

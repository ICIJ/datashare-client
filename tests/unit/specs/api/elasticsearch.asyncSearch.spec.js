import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { elasticsearch } from '@/api/elasticsearch'
import { EventBus } from '@/utils/eventBus'

describe('elasticsearch async search wrappers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('buildSearchDocsBody', () => {
    it('builds a body with pagination, highlighting and track_total_hits', () => {
      const body = elasticsearch.buildSearchDocsBody({ index: 'idx', query: 'foo', from: 25, perPage: 10 })
      expect(body.from).toBe(25)
      expect(body.size).toBe(10)
      expect(body.track_total_hits).toBe(true)
      expect(body.highlight).toBeDefined()
    })

    it('normalizes an empty query to the default', () => {
      const emptyBody = elasticsearch.buildSearchDocsBody({ index: 'idx', query: '' })
      const starBody = elasticsearch.buildSearchDocsBody({ index: 'idx', query: '*' })
      expect(emptyBody).toEqual(starBody)
    })
  })

  describe('submitAsyncSearch', () => {
    it('POSTs to _async_search with the timeout and keep_alive query params', async () => {
      const envelope = { id: 'abc', is_running: true }
      const spy = vi.spyOn(elasticsearch.transport, 'request').mockResolvedValue(envelope)
      const body = { query: { match_all: {} } }

      const result = await elasticsearch.submitAsyncSearch({
        index: 'a,b',
        body,
        waitForCompletionTimeout: '1s',
        keepAlive: '5m'
      })

      expect(result).toEqual(envelope)
      expect(spy).toHaveBeenCalledWith({
        method: 'POST',
        path: '/a,b/_async_search',
        query: { wait_for_completion_timeout: '1s', keep_alive: '5m' },
        body
      })
    })

    it('routes failures through the http::error bus and rejects', async () => {
      vi.spyOn(elasticsearch.transport, 'request').mockRejectedValue(new Error('boom'))
      const onError = vi.fn()
      EventBus.on('http::error', onError)

      await expect(
        elasticsearch.submitAsyncSearch({ index: 'a', body: {}, waitForCompletionTimeout: '1s', keepAlive: '5m' })
      ).rejects.toThrow('boom')
      expect(onError).toHaveBeenCalledTimes(1)

      EventBus.off('http::error', onError)
    })
  })

  describe('getAsyncSearch', () => {
    it('GETs the URL-encoded id with the completion timeout', async () => {
      const envelope = { id: 'a/b=', is_running: false, response: { hits: {} } }
      const spy = vi.spyOn(elasticsearch.transport, 'request').mockResolvedValue(envelope)

      const result = await elasticsearch.getAsyncSearch('a/b=', { waitForCompletionTimeout: '1s' })

      expect(result).toEqual(envelope)
      expect(spy).toHaveBeenCalledWith({
        method: 'GET',
        path: '/_async_search/a%2Fb%3D',
        query: { wait_for_completion_timeout: '1s' }
      })
    })

    it('omits the completion timeout from the query when not provided', async () => {
      const spy = vi.spyOn(elasticsearch.transport, 'request').mockResolvedValue({ is_running: false })

      await elasticsearch.getAsyncSearch('abc')

      expect(spy).toHaveBeenCalledWith({
        method: 'GET',
        path: '/_async_search/abc',
        query: {}
      })
    })
  })

  describe('abort handling', () => {
    it('does not emit http::error when the request fails after the signal aborted', async () => {
      vi.spyOn(elasticsearch.transport, 'request').mockRejectedValue(new Error('boom'))
      const onError = vi.fn()
      EventBus.on('http::error', onError)
      const controller = new AbortController()
      controller.abort()

      await expect(
        elasticsearch.getAsyncSearch('abc', { waitForCompletionTimeout: '1s', signal: controller.signal })
      ).rejects.toThrow('boom')
      expect(onError).not.toHaveBeenCalled()

      EventBus.off('http::error', onError)
    })

    it('aborts the in-flight transport request when the signal fires', async () => {
      const abort = vi.fn()
      const request = Promise.resolve({ is_running: true, id: 'abc' })
      request.abort = abort
      vi.spyOn(elasticsearch.transport, 'request').mockReturnValue(request)
      const controller = new AbortController()

      const promise = elasticsearch.getAsyncSearch('abc', {
        waitForCompletionTimeout: '1s',
        signal: controller.signal
      })
      controller.abort()
      await promise

      expect(abort).toHaveBeenCalledTimes(1)
    })
  })

  // Everything above mocks `elasticsearch.transport.request`, so it never
  // touches the real Transport/axios wiring. These tests go through the real
  // transport against a live ES, the only place a wire-format regression
  // (e.g. a malformed query string) would actually surface.
  describe('against a live Elasticsearch cluster', () => {
    const { index, es } = esConnectionHelper.build()

    it('round-trips a real search through submit, poll and delete', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContent('this is a document')).commit()

      const body = { query: { match_all: {} } }
      let envelope = await elasticsearch.submitAsyncSearch({
        index,
        body,
        waitForCompletionTimeout: '5s',
        keepAlive: '30s'
      })

      while (envelope.is_running) {
        envelope = await elasticsearch.getAsyncSearch(envelope.id, { waitForCompletionTimeout: '5s' })
      }

      expect(envelope.response.hits.hits).toHaveLength(1)
      expect(envelope.response.hits.hits[0]._id).toBe('document_01')

      // ES only assigns an id (and stores the result) when the search outlives
      // wait_for_completion_timeout; a search this small usually completes
      // inline with no id, so there is nothing to delete in that case.
      if (envelope.id) {
        await expect(elasticsearch.deleteAsyncSearch(envelope.id)).resolves.toBeDefined()
      }
    })
  })

  describe('deleteAsyncSearch', () => {
    it('DELETEs the URL-encoded id', async () => {
      const spy = vi.spyOn(elasticsearch.transport, 'request').mockResolvedValue({ acknowledged: true })

      await elasticsearch.deleteAsyncSearch('a/b=')

      expect(spy).toHaveBeenCalledWith({ method: 'DELETE', path: '/_async_search/a%2Fb%3D' })
    })

    it('does not emit http::error when the delete fails', async () => {
      vi.spyOn(elasticsearch.transport, 'request').mockRejectedValue(new Error('gone'))
      const onError = vi.fn()
      EventBus.on('http::error', onError)

      await expect(elasticsearch.deleteAsyncSearch('abc')).rejects.toThrow('gone')
      expect(onError).not.toHaveBeenCalled()

      EventBus.off('http::error', onError)
    })
  })
})

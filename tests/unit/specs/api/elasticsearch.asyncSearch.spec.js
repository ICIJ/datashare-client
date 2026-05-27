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
      const body = elasticsearch.buildSearchDocsBody({ index: 'idx', query: '' })
      const json = JSON.stringify(body)
      expect(json).toContain('"query":"*"')
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

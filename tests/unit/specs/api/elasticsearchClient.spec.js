import axios from 'axios'

import { Client, Transport } from '@/api/elasticsearchClient'

vi.mock('axios')

describe('elasticsearchClient', () => {
  beforeEach(() => {
    axios.mockReset()
    axios.mockResolvedValue({ data: { ok: true } })
  })

  describe('Transport', () => {
    it('resolves a host without a scheme to the current page protocol', () => {
      const transport = new Transport({ host: 'localhost:9009/api/index/search' })
      expect(transport.baseURL).toBe(`${window.location.protocol}//localhost:9009/api/index/search`)
    })

    it('keeps a host that already has a scheme as-is', () => {
      const transport = new Transport({ host: 'http://elasticsearch:9200' })
      expect(transport.baseURL).toBe('http://elasticsearch:9200')
    })

    it('resolves a bare hostname without a port to the current page protocol', () => {
      const transport = new Transport({ host: 'elasticsearch.example.com' })
      expect(transport.baseURL).toBe(`${window.location.protocol}//elasticsearch.example.com`)
    })

    it('issues the request with method, baseURL, path, body and timeout', async () => {
      const transport = new Transport({ host: 'http://elasticsearch:9200', requestTimeout: 30000 })
      await transport.request({ method: 'POST', path: '/my-index/_search', body: { query: {} } })

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          baseURL: 'http://elasticsearch:9200',
          url: '/my-index/_search',
          data: { query: {} },
          timeout: 30000
        })
      )
    })

    it('defaults requestTimeout to 30000 when omitted', async () => {
      const transport = new Transport({ host: 'http://elasticsearch:9200' })
      await transport.request({ path: '/my-index/_search' })

      expect(axios.mock.calls[0][0].timeout).toBe(30000)
    })

    it('serializes array query params as comma-separated lists', async () => {
      const transport = new Transport({ host: 'http://elasticsearch:9200' })
      await transport.request({ path: '/my-index/_search', query: { _source: ['title', 'path'] } })

      expect(axios.mock.calls[0][0].params).toEqual({ _source: 'title,path' })
    })

    it('drops undefined query params instead of serializing them as empty', async () => {
      const transport = new Transport({ host: 'http://elasticsearch:9200' })
      await transport.request({ path: '/my-index/_search', query: { size: 3, routing: undefined } })

      expect(axios.mock.calls[0][0].params).toEqual({ size: 3 })
    })

    it('resolves with the response body, not the full axios response', async () => {
      axios.mockResolvedValue({ data: { hits: { total: 0 } } })
      const transport = new Transport({ host: 'http://elasticsearch:9200' })
      await expect(transport.request({ path: '/my-index/_search' })).resolves.toEqual({ hits: { total: 0 } })
    })

    it('rejects with the same error object, decorated in place rather than re-wrapped', async () => {
      const axiosError = Object.assign(new Error('Request failed with status code 400'), {
        isAxiosError: true,
        response: { status: 400 }
      })
      axios.mockRejectedValue(axiosError)

      const transport = new Transport({ host: 'http://elasticsearch:9200' })
      await expect(transport.request({ path: '/my-index/_search' })).rejects.toBe(axiosError)
    })

    it('decorates an HTTP error response with status, displayName and the ES error message', async () => {
      const axiosError = Object.assign(new Error('Request failed with status code 404'), {
        isAxiosError: true,
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { error: { root_cause: [{ type: 'index_not_found_exception', reason: 'no such index [x]' }] } }
        }
      })
      axios.mockRejectedValue(axiosError)

      const transport = new Transport({ host: 'http://elasticsearch:9200' })
      await expect(transport.request({ path: '/my-index/_search' })).rejects.toMatchObject({
        status: 404,
        displayName: 'NotFound',
        message: '[index_not_found_exception] no such index [x]'
      })
    })

    it('decorates an HTTP error response without touching the message when ES sends no error body', async () => {
      const axiosError = Object.assign(new Error('Request failed with status code 400'), {
        isAxiosError: true,
        response: { status: 400, statusText: 'Bad Request' }
      })
      axios.mockRejectedValue(axiosError)

      const transport = new Transport({ host: 'http://elasticsearch:9200' })
      await expect(transport.request({ path: '/my-index/_search' })).rejects.toMatchObject({
        status: 400,
        displayName: 'BadRequest',
        message: 'Request failed with status code 400'
      })
    })

    it('decorates a timeout with displayName RequestTimeout', async () => {
      const timeoutError = Object.assign(new Error('timeout of 60000ms exceeded'), { code: 'ECONNABORTED' })
      axios.mockRejectedValue(timeoutError)

      const transport = new Transport({ host: 'http://elasticsearch:9200' })
      await expect(transport.request({ path: '/my-index/_search' })).rejects.toMatchObject({ displayName: 'RequestTimeout' })
    })

    it('decorates a network-level failure with displayName ConnectionFault once retries are exhausted', async () => {
      const networkError = Object.assign(new Error('Network Error'), { isAxiosError: true })
      axios.mockRejectedValue(networkError)

      const transport = new Transport({ host: 'http://elasticsearch:9200', maxRetries: 0 })
      await expect(transport.request({ path: '/my-index/_search' })).rejects.toMatchObject({ displayName: 'ConnectionFault' })
    })

    it('does not decorate an aborted request', async () => {
      const networkError = Object.assign(new Error('Network Error'), { isAxiosError: true, name: 'AbortError' })
      axios.mockRejectedValue(networkError)

      const transport = new Transport({ host: 'http://elasticsearch:9200' })
      const promise = transport.request({ path: '/my-index/_search' })
      promise.abort()

      await expect(promise).rejects.not.toHaveProperty('displayName')
    })

    it('does not retry an HTTP error response (e.g. a 400)', async () => {
      const axiosError = Object.assign(new Error('Bad Request'), { isAxiosError: true, response: { status: 400 } })
      axios.mockRejectedValue(axiosError)

      const transport = new Transport({ host: 'http://elasticsearch:9200' })
      await expect(transport.request({ path: '/my-index/_search' })).rejects.toBe(axiosError)
      expect(axios).toHaveBeenCalledTimes(1)
    })

    it('does not retry a timeout', async () => {
      const timeoutError = Object.assign(new Error('timeout of 60000ms exceeded'), { code: 'ECONNABORTED' })
      axios.mockRejectedValue(timeoutError)

      const transport = new Transport({ host: 'http://elasticsearch:9200' })
      await expect(transport.request({ path: '/my-index/_search' })).rejects.toBe(timeoutError)
      expect(axios).toHaveBeenCalledTimes(1)
    })

    it('retries a network-level failure (no response) and resolves once a retry succeeds', async () => {
      const networkError = Object.assign(new Error('Network Error'), { isAxiosError: true })
      axios.mockRejectedValueOnce(networkError).mockRejectedValueOnce(networkError).mockResolvedValueOnce({ data: { ok: true } })

      const transport = new Transport({ host: 'http://elasticsearch:9200' })
      await expect(transport.request({ path: '/my-index/_search' })).resolves.toEqual({ ok: true })
      expect(axios).toHaveBeenCalledTimes(3)
    })

    it('gives up after the default of 3 retries and rejects with the last network error', async () => {
      const networkError = Object.assign(new Error('Network Error'), { isAxiosError: true })
      axios.mockRejectedValue(networkError)

      const transport = new Transport({ host: 'http://elasticsearch:9200' })
      await expect(transport.request({ path: '/my-index/_search' })).rejects.toBe(networkError)
      // 1 initial attempt + 3 retries
      expect(axios).toHaveBeenCalledTimes(4)
    })

    it('honors a custom maxRetries', async () => {
      const networkError = Object.assign(new Error('Network Error'), { isAxiosError: true })
      axios.mockRejectedValue(networkError)

      const transport = new Transport({ host: 'http://elasticsearch:9200', maxRetries: 1 })
      await expect(transport.request({ path: '/my-index/_search' })).rejects.toBe(networkError)
      expect(axios).toHaveBeenCalledTimes(2)
    })

    it('stops retrying once the request has been aborted', async () => {
      const networkError = Object.assign(new Error('Network Error'), { isAxiosError: true })
      axios.mockRejectedValue(networkError)

      const transport = new Transport({ host: 'http://elasticsearch:9200' })
      const promise = transport.request({ path: '/my-index/_search' })
      promise.abort()

      await expect(promise).rejects.toBe(networkError)
      expect(axios).toHaveBeenCalledTimes(1)
    })

    it('aborts the in-flight request via the signal', async () => {
      const transport = new Transport({ host: 'http://elasticsearch:9200' })
      const promise = transport.request({ path: '/my-index/_search' })
      const { signal } = axios.mock.calls[0][0]

      expect(signal.aborted).toBe(false)
      promise.abort()
      expect(signal.aborted).toBe(true)

      await promise
    })
  })

  describe('Client', () => {
    it('builds a GET on /:index/_doc/:id for get', async () => {
      const client = new Client({ host: 'http://elasticsearch:9200' })
      await client.get({ index: 'my-index', id: 'doc-1', routing: 'route-1' })

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', url: '/my-index/_doc/doc-1', params: { routing: 'route-1' } })
      )
    })

    it('encodes the id on get', async () => {
      const client = new Client({ host: 'http://elasticsearch:9200' })
      await client.get({ index: 'my-index', id: 'a/b c' })

      expect(axios).toHaveBeenCalledWith(expect.objectContaining({ url: '/my-index/_doc/a%2Fb%20c' }))
    })

    it('builds a GET on /:index/_source/:id for getSource', async () => {
      const client = new Client({ host: 'http://elasticsearch:9200' })
      await client.getSource({ index: 'my-index', id: 'doc-1', _source: 'title' })

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'GET', url: '/my-index/_source/doc-1', params: { _source: 'title' } })
      )
    })

    it('builds a POST on /:index/_search with the body for search', async () => {
      const client = new Client({ host: 'http://elasticsearch:9200' })
      const body = { query: { match_all: {} } }
      await client.search({ index: 'my-index', body, size: 3 })

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'POST', url: '/my-index/_search', data: body, params: { size: 3 } })
      )
    })

    it('builds a POST on /:index/_count with the body for count', async () => {
      const client = new Client({ host: 'http://elasticsearch:9200' })
      const body = { query: { match_all: {} } }
      await client.count({ index: 'my-index', body })

      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'POST', url: '/my-index/_count', data: body })
      )
    })
  })
})

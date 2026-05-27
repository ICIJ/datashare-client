import { runAsyncSearch } from '@/api/asyncSearch'

function makeClient() {
  return {
    submitAsyncSearch: vi.fn(),
    getAsyncSearch: vi.fn(),
    deleteAsyncSearch: vi.fn().mockResolvedValue({ acknowledged: true })
  }
}

const opts = { pollInterval: 10, maxWait: 100000, waitForCompletionTimeout: '1s', keepAlive: '5m' }

describe('runAsyncSearch', () => {
  it('fast path: returns the response without polling or deleting', async () => {
    const client = makeClient()
    client.submitAsyncSearch.mockResolvedValue({ is_running: false, response: { hits: {} } })

    const res = await runAsyncSearch(client, { index: 'idx', body: {} }, opts)

    expect(res).toEqual({ hits: {} })
    expect(client.getAsyncSearch).not.toHaveBeenCalled()
    expect(client.deleteAsyncSearch).not.toHaveBeenCalled()
  })

  it('completed-with-id path: returns the response and deletes the id without polling', async () => {
    const client = makeClient()
    client.submitAsyncSearch.mockResolvedValue({ is_running: false, id: 'abc', response: { hits: {} } })

    const res = await runAsyncSearch(client, { index: 'idx', body: {} }, opts)

    expect(res).toEqual({ hits: {} })
    expect(client.getAsyncSearch).not.toHaveBeenCalled()
    expect(client.deleteAsyncSearch).toHaveBeenCalledTimes(1)
    expect(client.deleteAsyncSearch).toHaveBeenCalledWith('abc')
  })

  it('polled path: polls until done, returns response, deletes the id once', async () => {
    vi.useFakeTimers()
    const client = makeClient()
    client.submitAsyncSearch.mockResolvedValue({ is_running: true, id: 'abc' })
    client.getAsyncSearch
      .mockResolvedValueOnce({ is_running: true, id: 'abc' })
      .mockResolvedValueOnce({ is_running: false, id: 'abc', response: { hits: { total: { value: 1 } } } })

    const promise = runAsyncSearch(client, { index: 'idx', body: {} }, opts)
    await vi.runAllTimersAsync()
    const res = await promise

    expect(res).toEqual({ hits: { total: { value: 1 } } })
    expect(client.getAsyncSearch).toHaveBeenCalledTimes(2)
    expect(client.deleteAsyncSearch).toHaveBeenCalledTimes(1)
    expect(client.deleteAsyncSearch).toHaveBeenCalledWith('abc')
    vi.useRealTimers()
  })

  it('abort: rejects with an AbortError and deletes the id', async () => {
    const client = makeClient()
    client.submitAsyncSearch.mockResolvedValue({ is_running: true, id: 'abc' })
    const controller = new AbortController()
    controller.abort()

    await expect(
      runAsyncSearch(client, { index: 'idx', body: {} }, { ...opts, signal: controller.signal })
    ).rejects.toMatchObject({ name: 'AbortError' })
    expect(client.deleteAsyncSearch).toHaveBeenCalledWith('abc')
  })

  it('ceiling: rejects when maxWait is exceeded and deletes the id', async () => {
    const client = makeClient()
    client.submitAsyncSearch.mockResolvedValue({ is_running: true, id: 'abc' })

    await expect(
      runAsyncSearch(client, { index: 'idx', body: {} }, { ...opts, maxWait: 0 })
    ).rejects.toThrow(/maximum wait/i)
    expect(client.deleteAsyncSearch).toHaveBeenCalledWith('abc')
  })
})

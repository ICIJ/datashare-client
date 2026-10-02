describe('indexDistribution', () => {
  let api, isOpenSearchDistribution

  beforeEach(async () => {
    vi.resetModules()
    ;({ isOpenSearchDistribution } = await import('@/api/indexDistribution'))
    api = { getVersionSilently: vi.fn() }
  })

  it('resolves true when the backend reports an opensearch distribution', async () => {
    api.getVersionSilently.mockResolvedValue({ 'index.distribution': 'opensearch' })

    await expect(isOpenSearchDistribution(api)).resolves.toBe(true)
  })

  it('resolves false when the backend reports an elasticsearch distribution', async () => {
    api.getVersionSilently.mockResolvedValue({ 'index.distribution': 'elasticsearch' })

    await expect(isOpenSearchDistribution(api)).resolves.toBe(false)
  })

  it('caches a conclusive verdict for the session', async () => {
    api.getVersionSilently.mockResolvedValue({ 'index.distribution': 'opensearch' })

    await isOpenSearchDistribution(api)
    await isOpenSearchDistribution(api)

    expect(api.getVersionSilently).toHaveBeenCalledTimes(1)
  })

  it('resolves false on an "unknown" distribution and retries on the next call', async () => {
    api.getVersionSilently.mockResolvedValueOnce({ 'index.distribution': 'unknown' })
    api.getVersionSilently.mockResolvedValue({ 'index.distribution': 'opensearch' })

    await expect(isOpenSearchDistribution(api)).resolves.toBe(false)
    await expect(isOpenSearchDistribution(api)).resolves.toBe(true)

    expect(api.getVersionSilently).toHaveBeenCalledTimes(2)
  })

  it('resolves false on a payload without the distribution key and retries on the next call', async () => {
    api.getVersionSilently.mockResolvedValueOnce(null)
    api.getVersionSilently.mockResolvedValue({ 'index.distribution': 'opensearch' })

    await expect(isOpenSearchDistribution(api)).resolves.toBe(false)
    await expect(isOpenSearchDistribution(api)).resolves.toBe(true)
  })

  it('resolves false when the probe rejects and retries on the next call', async () => {
    api.getVersionSilently.mockRejectedValueOnce(new Error('backend unreachable'))
    api.getVersionSilently.mockResolvedValue({ 'index.distribution': 'opensearch' })

    await expect(isOpenSearchDistribution(api)).resolves.toBe(false)
    await expect(isOpenSearchDistribution(api)).resolves.toBe(true)
  })

  it('shares a single in-flight probe between concurrent calls', async () => {
    api.getVersionSilently.mockResolvedValue({ 'index.distribution': 'opensearch' })

    await Promise.all([isOpenSearchDistribution(api), isOpenSearchDistribution(api)])

    expect(api.getVersionSilently).toHaveBeenCalledTimes(1)
  })
})

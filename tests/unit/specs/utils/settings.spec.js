import settings from '@/utils/settings'

describe('settings.elasticsearch.asyncSearch', () => {
  it('exposes the async search timing knobs', () => {
    expect(settings.elasticsearch.asyncSearch).toEqual({
      waitForCompletionTimeout: '1s',
      pollInterval: 1000,
      keepAlive: '5m',
      maxWait: 300000
    })
  })
})

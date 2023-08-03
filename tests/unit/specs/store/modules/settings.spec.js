import { storeBuilder } from '@/store/storeBuilder'

describe('SettingsStore', () => {
  let api, store
  beforeAll(() => {
    api = { getSettings: jest.fn(), setSettings: jest.fn() }
    store = storeBuilder(api)
  })

  it('should call the getSettings url', () => {
    store.dispatch('settings/getSettings')
    expect(api.getSettings).toBeCalledTimes(1)
  })

  it('should send the settings modifications', () => {
    store.dispatch('settings/onSubmit', { foo: 'bar' })
    expect(api.setSettings).toBeCalledTimes(1)
    expect(api.setSettings).toBeCalledWith({ foo: 'bar' })
  })
})

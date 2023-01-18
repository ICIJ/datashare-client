import { Api } from '@/api'
import { storeBuilder } from '@/store/storeBuilder'

describe('PlayerStore', () => {
  let store

  beforeAll(() => {
    const api = new Api(null, null)
    store = storeBuilder(api)
  })

  it('should change the autoplay value to true', () => {
    store.commit('player/autoplay', true)
    expect(store.state.player.autoplay).toBeTruthy()
  })

  it('should change the loop value to true', () => {
    store.commit('player/loop', true)
    expect(store.state.player.loop).toBeTruthy()
  })

  it('should change the autoplay value to false', () => {
    store.commit('player/autoplay', false)
    expect(store.state.player.autoplay).toBeFalsy()
  })

  it('should change the loop value to false', () => {
    store.commit('player/loop', false)
    expect(store.state.player.loop).toBeFalsy()
  })
})

import { storeBuilder } from '@/store/storeBuilder'

describe('PlayerStore', () => {
  let store

  beforeAll(() => {
    store = storeBuilder()
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

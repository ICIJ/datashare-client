export const state = () => ({
  autoplay: false,
  loop: true
})

export const mutations = {
  autoplay(state, autoplay) {
    state.autoplay = autoplay
  },
  loop(state, loop) {
    state.loop = loop
  }
}

export default {
  namespaced: true,
  mutations,
  state
}

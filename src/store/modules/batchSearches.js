export function initialState () {
  return {
    name: '',
    description: '',
    file: null
  }
}

export const state = initialState

export const mutations = {}

export const actions = {
  onSubmit () {
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

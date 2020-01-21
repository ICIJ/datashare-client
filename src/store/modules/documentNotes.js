import DatashareClient from '@/api/DatashareClient'

export const datashare = new DatashareClient()

export const actions = {
  retrieveNotes (state, { project, path }) {
    return datashare.retrieveNotes(project, path)
  }
}

export default {
  namespaced: true,
  actions
}

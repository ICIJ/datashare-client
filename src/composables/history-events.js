import { useCore } from '@/composables/core'

export const useHistoryEvents = (type) => {
  const { core } = useCore()

  function save({ id = null, projectIds, name, uri, }) {
    if (id) {
      return rename({ id, name })
    }

    return add({ projectIds, type, name, uri })
  }

  function rename({ id, name }) {
    return core.api.renameHistoryEvent(id, name)
  }

  function add({ projectIds, name, uri }) {
    return core.api.addHistoryEvent(projectIds, type, name, uri)
  }

  function remove({ id }) {
    return core.api.deleteHistoryEvent(id)
  }

  function removeAll() {
    return core.api.deleteHistoryEvents(type)
  }

  return { save, remove, removeAll }
}

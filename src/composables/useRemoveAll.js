import { useCore } from '@/composables/useCore'
import { useSearchStore } from '@/store/modules/search'
import { apiInstance as api } from '@/api/apiInstance'

export const useRemoveAll = () => {
  const { core } = useCore()
  const searchStore = useSearchStore()

  async function resetDefaultProject() {
    await core.createDefaultProject()
    await core.loadUser()
    searchStore.setIndex(core.config.get('defaultProject'))
  }

  async function removeAll() {
    await api.removeProjects()
    await api.removeBatchSearches()
    await resetDefaultProject()
  }

  return { removeAll }
}

import { useSearchStore } from '@/store/modules'

export const prefillSearchStore = (to) => {
  const searchStore = useSearchStore()
  searchStore.updateFromRouteQuery(to.query)
}

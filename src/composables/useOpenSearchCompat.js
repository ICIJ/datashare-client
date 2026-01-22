import { ref, onMounted } from 'vue'

import { apiInstance as api } from '@/api/apiInstance'

const INDEX_DISTRIBUTION = 'index.distribution'
const OPENSEARCH = 'opensearch'

export function useOpenSearchCompat() {
  const isOpenSearch = ref(false)

  async function fetchIsOpenSearch() {
    const version = await api.getVersion()
    isOpenSearch.value = version[INDEX_DISTRIBUTION] === OPENSEARCH
  }

  onMounted(fetchIsOpenSearch)

  return { isOpenSearch }
}

export default useOpenSearchCompat

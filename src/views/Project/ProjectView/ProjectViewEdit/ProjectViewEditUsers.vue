<script setup>
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import ProjectUsersList from '@/components/ProjectUsers/ProjectUsersList.vue'
import RowPaginationUsers from '@/components/RowPagination/RowPaginationUsers.vue'
import { useCore } from '@/composables/useCore.js'
import { useToast } from '@/composables/useToast.js'

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

const core = useCore()
const { toast } = useToast()
const { t } = useI18n()

const PER_PAGE = 10

const users = ref([])
const loading = ref(false)
const page = ref(1)
const totalRows = ref(0)
const query = ref('')

let debounceTimer = null

async function fetchUsers() {
  loading.value = true
  try {
    const from = (page.value - 1) * PER_PAGE
    const to = page.value * PER_PAGE
    const user = query.value.trim() || null
    const { items, pagination } = await core.api.getProjectPolicies('default', props.name, { from, to, user })
    users.value = (items ?? []).map(({ v0: name, v1: role }) => ({ name, role }))
    totalRows.value = pagination?.total ?? 0
  }
  catch {
    toast.error(t('projectViewEdit.users.fetchError'))
  }
  finally {
    loading.value = false
  }
}

function onQueryUpdate(value) {
  query.value = value
  page.value = 1
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchUsers, 300)
}

onMounted(fetchUsers)
watch(page, fetchUsers)
</script>

<template>
  <div class="project-view-edit-users p-4">
    <project-users-list
      :users="users"
      :project-name="name"
      :query="query"
      @update:query="onQueryUpdate"
    />
    <row-pagination-users
      v-model:page="page"
      :total-rows="totalRows"
      :per-page="PER_PAGE"
    />
  </div>
</template>

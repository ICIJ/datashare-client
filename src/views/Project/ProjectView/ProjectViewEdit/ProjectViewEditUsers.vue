<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import ProjectUsersList from '@/components/ProjectUsers/ProjectUsersList.vue'
import RowPaginationUsers from '@/components/RowPagination/RowPaginationUsers.vue'
import { useCore } from '@/composables/useCore.js'
import { useToast } from '@/composables/useToast.js'
import { useUrlParam } from '@/composables/useUrlParam.js'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch.vue'
import ProjectUsersCreateModal from '@/components/ProjectUsers/ProjectUsersCreateModal.vue'
import IPhUserPlus from '~icons/ph/user-plus'
import { apiInstance as api } from '@/api/apiInstance.js'

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
const totalRows = ref(0)
const query = ref('')
const page = ref(1)

const sort = useUrlParam('sort', null)
const order = useUrlParam('order', 'asc')

let debounceTimer = null

const AUTH_MODE_PWD = ['form', 'basic']
const isPasswordProvider = computed(() => AUTH_MODE_PWD.includes(core.config.get('auth')))

async function fetchUsers() {
  loading.value = true
  try {
    const from = (page.value - 1) * PER_PAGE
    const to = from + PER_PAGE
    const { items, pagination } = await api.getProjectPolicies('default', props.name, {
      from,
      to,
      user: query.value || null
    })
    users.value = (items ?? []).map(({ v0, v1 }) => ({ name: v0, role: v1 }))
    totalRows.value = pagination?.total ?? 0
  }
  catch {
    toast.error(t('projectViewEdit.users.fetchError'))
  }
  finally {
    loading.value = false
  }
}

function onPageChange(newPage) {
  page.value = newPage
  fetchUsers()
}

function onQueryUpdate(value) {
  query.value = value
  page.value = 1
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchUsers, 300)
}

const localUsers = ref([])
function onUserCreated({ name, role }) {
  localUsers.value.push({ name, role })
}

const showCreateModal = ref(false)

function onUserDeleted({ name }) {
  localUsers.value = localUsers.value.filter(u => u.name !== name)
}

onMounted(fetchUsers)

</script>

<template>
  <div class="project-view-edit-users p-4">
    <div class="d-flex flex-column gap-2 mb-3">
      <div class="d-flex justify-content-end">
        <button-icon
          v-if="isPasswordProvider"
          :icon-left="IPhUserPlus"
          variant="action"
          class=" d-flex "
          @click="showCreateModal = true"
        >
          {{ t('projectViewEdit.users.create.button') }}
        </button-icon>
      </div>
      <div class="d-flex justify-content-between  flex-grow-1 ">
        <row-pagination-users
          :page="page"
          :total-rows="totalRows"
          :per-page="PER_PAGE"
          class="d-flex"
          @update:page="onPageChange"
        />
        <form-control-search
          v-model="query"
          clear-text
        />
      </div>
    </div>
    <project-users-create-modal
      v-model="showCreateModal"
      :project="name"
      @user:created="onUserCreated"
    />
    <project-users-list
      v-model:query="query"
      v-model:sort="sort"
      v-model:order="order"
      :users="users"
      :project="name"
      @update:query="onQueryUpdate"
      @user:deleted="onUserDeleted"
    />
  </div>
</template>

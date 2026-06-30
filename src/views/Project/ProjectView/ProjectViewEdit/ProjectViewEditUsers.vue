<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import ProjectUsersList from '@/components/ProjectUsers/ProjectUsersList.vue'
import RowPaginationUsers from '@/components/RowPagination/RowPaginationUsers.vue'
import { useCore } from '@/composables/useCore.js'
import { useToast } from '@/composables/useToast.js'
import { useUrlParam } from '@/composables/useUrlParam.js'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch.vue'
import ProjectUsersCreateModal from '@/components/ProjectUsers/ProjectUsersCreateModal.vue'
import IPhUserPlus from '~icons/ph/user-plus'

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

const core = useCore()
const { toast } = useToast()
const { t } = useI18n()
const route = useRoute()

const PER_PAGE = 10
const SORT_FIELD_MAP = { name: 'uid' }

const users = ref([])
const loading = ref(false)
const totalRows = ref(0)
const query = ref('')

const sort = useUrlParam('sort', null)
const order = useUrlParam('order', 'asc')
const page = useUrlParam('page', { transform: v => parseInt(v) || 1, initialValue: 1 })

let debounceTimer = null

const apiSort = computed(() => (sort.value ? (SORT_FIELD_MAP[sort.value] ?? sort.value) : null))
const AUTH_MODE_PWD = ['form', 'basic']
const isPasswordProvider = computed(() => AUTH_MODE_PWD.includes(core.config.get('auth')))

async function fetchUsers() {
  loading.value = true
  try {
    const from = (page.value - 1) * PER_PAGE
    const desc = order.value === 'desc' ? true : null
    const { items, pagination } = await core.api.getUsers({
      project: props.name,
      from,
      size: PER_PAGE,
      sort: apiSort.value,
      desc
    })
    users.value = (items ?? []).map(({ uid, permissions }) => ({
      name: uid,
      role: permissions?.[0]?.v1 ?? null
    }))
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

const localUsers = ref(users.value.map(u => ({ ...u })))
function onUserCreated({ name, role }) {
  localUsers.value.push({ name, role })
}

const showCreateModal = ref(false)

function onUserDeleted({ name }) {
  localUsers.value = localUsers.value.filter(u => u.name !== name)
}
// eslint-disable-next-line @stylistic/max-statements-per-line
watch([sort, order], () => { page.value = 1 })
watch(() => route.query, fetchUsers, { deep: true, immediate: true })

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
          v-model:page="page"
          :total-rows="totalRows"
          :per-page="PER_PAGE"
          class="d-flex"
        />
        <form-control-search
          v-model="query"
          clear-text
        />
      </div>
    </div>
    <project-users-create-modal
      v-model="showCreateModal"
      :project-name="name"
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

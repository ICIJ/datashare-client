<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import debounce from 'lodash/debounce'

import image from '@/assets/images/illustrations/app-modal-default-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-default-dark.svg'
import AppModal from '@/components/AppModal/AppModal.vue'
import DisplayUser from '@/components/Display/DisplayUser.vue'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch.vue'
import ProjectLabel from '@/components/Project/ProjectLabel.vue'
import ProjectUsersRoleDropdown from '@/components/ProjectUsers/ProjectUsersRoleDropdown.vue'

import { useCore } from '@/composables/useCore.js'
import { useToast } from '@/composables/useToast.js'
import { DEFAULT_ROLE, ROLE, ROLE_LOWERCASE } from '@/enums/roles.js'

const props = defineProps({
  project: {
    type: String,
    required: true
  }
})

const modelValue = defineModel({ type: Boolean })
const emit = defineEmits(['user:added'])

const core = useCore()
const { toast } = useToast()
const { t } = useI18n()

const query = ref('')
const results = ref([])
const searching = ref(false)
const selectedUser = ref(null)
const selectedRole = ref(DEFAULT_ROLE)
const saving = ref(false)

async function search() {
  const q = query.value.trim()
  if (!q) {
    results.value = []
    return
  }
  searching.value = true
  try {
    const { items } = await core.api.getUsers({ q })
    results.value = items ?? []
  }
  catch {
    results.value = []
  }
  finally {
    searching.value = false
  }
}
const debouncedSearch = debounce(search, 200)
watch(query, debouncedSearch)

function selectUser(user) {
  selectedUser.value = user
}

function clearSelection() {
  selectedUser.value = null
}

function resetForm() {
  query.value = ''
  results.value = []
  selectedUser.value = null
  selectedRole.value = DEFAULT_ROLE
}

const isValid = computed(() => !!selectedUser.value)

async function saveUser(bvModalEvent) {
  bvModalEvent?.preventDefault()
  if (!isValid.value) return
  saving.value = true
  try {
    const uid = selectedUser.value.uid
    await core.api.grantUserRole(uid, props.project, ROLE_LOWERCASE[selectedRole.value])
    toast.success(t('projectViewEdit.users.add.saveSuccess'))
    emit('user:added', { uid })
    resetForm()
    modelValue.value = false
  }
  catch {
    toast.error(t('projectViewEdit.users.add.saveError'))
  }
  finally {
    saving.value = false
  }
}

defineExpose({
  query,
  results,
  searching,
  selectedUser,
  selectedRole,
  isValid,
  saving,
  selectUser,
  clearSelection,
  saveUser
})
</script>

<template>
  <app-modal
    v-model="modelValue"
    :image="image"
    :image-dark="imageDark"
    :title="t('projectViewEdit.users.add.title')"
    :ok-title="t('projectViewEdit.users.add.confirm')"
    :ok-disabled="!isValid || saving"
    size="lg"
    @ok="saveUser"
  >
    <template v-if="!selectedUser">
      <form-control-search
        v-model="query"
        autofocus
        clear-text
        :loading="searching"
        :placeholder="t('projectViewEdit.users.add.searchPlaceholder')"
      />
      <ul class="list-unstyled mt-3 mb-0">
        <li
          v-for="user in results"
          :key="user.uid"
        >
          <button
            type="button"
            class="btn btn-link p-2 text-start w-100"
            @click="selectUser(user)"
          >
            <display-user :value="user.uid" />
          </button>
        </li>
        <li
          v-if="query.trim() && !searching && !results.length"
          class="text-secondary small p-2"
        >
          {{ t('projectViewEdit.users.add.noResults') }}
        </li>
      </ul>
    </template>
    <template v-else>
      <div class="d-flex align-items-center justify-content-between mb-3">
        <display-user :value="selectedUser.uid" />
        <button
          type="button"
          class="btn btn-link"
          @click="clearSelection"
        >
          {{ t('projectViewEdit.users.add.change') }}
        </button>
      </div>
      <div class="d-flex align-items-center gap-2">
        <project-users-role-dropdown
          v-model="selectedRole"
          :project="project"
          :hidden-roles="[ROLE.DOMAIN_ADMIN, ROLE.INSTANCE_ADMIN]"
        />
        <i18n-t keypath="projectViewEdit.users.add.fields.role.inProject">
          <template #project>
            <project-label :project="project" />
          </template>
        </i18n-t>
      </div>
    </template>
  </app-modal>
</template>

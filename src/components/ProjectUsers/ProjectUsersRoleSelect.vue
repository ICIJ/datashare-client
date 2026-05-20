<script setup>
import { computed, ref, watch } from 'vue'
import { AppIcon, ButtonIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import IPhCheck from '~icons/ph/check'
import IPhCheckCircle from '~icons/ph/check-circle'
import IPhX from '~icons/ph/x'

import { useCore } from '@/composables/useCore.js'
import { usePolicies } from '@/composables/usePolicies.js'
import { useToast } from '@/composables/useToast.js'
import { ROLE, ROLE_BIT, ROLE_HIERARCHY } from '@/enums/roles.js'

const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  projectName: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['role:saved'])

const core = useCore()
const { getRoleByProject, formatRole } = usePolicies()
const { toast } = useToast()
const { t } = useI18n()

const committedRole = ref(props.user.role)
const selectedRole = ref(props.user.role)
const saving = ref(false)
const saved = ref(false)

watch(() => props.user.role, (newRole) => {
  committedRole.value = newRole
  selectedRole.value = newRole
  saved.value = false
})

const currentUserRole = computed(() => getRoleByProject(props.projectName))

const availableRoles = computed(() =>
  Object.values(ROLE)
    .filter(role => (ROLE_HIERARCHY[currentUserRole.value] & ROLE_BIT[role]) !== 0)
    .sort((a, b) => ROLE_BIT[b] - ROLE_BIT[a])
    .map(role => ({ value: role, text: formatRole(t, role) }))
)

const dirty = computed(() => selectedRole.value !== committedRole.value)

watch(dirty, (isDirty) => {
  if (isDirty) saved.value = false
})

async function confirm() {
  saving.value = true
  try {
    await core.api.saveProjectPolicy('default', props.projectName, {
      user: props.user.name,
      role: selectedRole.value
    })
    committedRole.value = selectedRole.value
    saved.value = true
    emit('role:saved', { name: props.user.name, role: selectedRole.value })
  } catch {
    selectedRole.value = committedRole.value
    toast.error(t('projectViewEdit.users.roleSelect.saveError'))
  } finally {
    saving.value = false
  }
}

function cancel() {
  selectedRole.value = committedRole.value
}

defineExpose({ selectedRole, committedRole, dirty, saved, saving, confirm, cancel, availableRoles })
</script>

<template>
  <div class="project-users-role-select d-inline-flex align-items-center gap-2">
    <b-form-select
      v-model="selectedRole"
      :options="availableRoles"
      :disabled="saving"
      size="sm"
    />
    <template v-if="dirty">
      <button-icon
        hide-label
        variant="outline-success"
        size="sm"
        :icon-left="IPhCheck"
        :disabled="saving"
        @click="confirm"
      >
        {{ t('projectViewEdit.users.roleSelect.confirm') }}
      </button-icon>
      <button-icon
        hide-label
        variant="outline-secondary"
        size="sm"
        :icon-left="IPhX"
        :disabled="saving"
        @click="cancel"
      >
        {{ t('projectViewEdit.users.roleSelect.cancel') }}
      </button-icon>
    </template>
    <app-icon
      v-if="saved && !dirty"
      :name="IPhCheckCircle"
      style="color: var(--bs-success)"
    />
  </div>
</template>

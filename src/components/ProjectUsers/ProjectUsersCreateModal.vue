<script setup>
import { computed, ref } from 'vue'
import { AppIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import IPhTextAa from '~icons/ph/text-aa'

import image from '@/assets/images/illustrations/app-modal-default-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-default-dark.svg'
import AppModal from '@/components/AppModal/AppModal.vue'

import { useCore } from '@/composables/useCore.js'
import { usePolicies } from '@/composables/usePolicies.js'
import { useToast } from '@/composables/useToast.js'
import { DEFAULT_ROLE, ROLE, ROLE_BIT, ROLE_HIERARCHY } from '@/enums/roles.js'

const props = defineProps({
  projectName: {
    type: String,
    required: true
  }
})

const modelValue = defineModel({ type: Boolean })
const emit = defineEmits(['user:created'])

const core = useCore()
const { getRoleByProject, formatRole } = usePolicies()
const { toast } = useToast()
const { t } = useI18n()

const username = ref('')
const selectedRole = ref(DEFAULT_ROLE)
const saving = ref(false)

const currentUserRole = computed(() => getRoleByProject(props.projectName))

const availableRoles = computed(() =>
  Object.values(ROLE)
    .filter(role => (ROLE_HIERARCHY[currentUserRole.value] & ROLE_BIT[role]) !== 0)
    .sort((a, b) => ROLE_BIT[b] - ROLE_BIT[a])
    .map(role => ({ value: role, text: formatRole(t, role) }))
)

const isValid = computed(() => username.value.trim().length > 0)

async function createUser() {
  saving.value = true
  try {
    await core.api.saveProjectPolicy('default', props.projectName, {
      user: username.value.trim(),
      role: selectedRole.value
    })
    emit('user:created', { name: username.value.trim(), role: selectedRole.value })
    username.value = ''
    selectedRole.value = DEFAULT_ROLE
    modelValue.value = false
  } catch {
    toast.error(t('projectViewEdit.users.create.saveError'))
  } finally {
    saving.value = false
  }
}

defineExpose({ username, selectedRole, isValid, saving, createUser, availableRoles })
</script>

<template>
  <app-modal
    v-model="modelValue"
    :image="image"
    :image-dark="imageDark"
    :title="t('projectViewEdit.users.create.title')"
    :ok-title="t('projectViewEdit.users.create.confirm')"
    :ok-disabled="!isValid || saving"
    ok-variant="primary"
    ok-only
    @ok="createUser"
  >
    <div class="d-flex flex-column gap-3">
      <div class="d-flex align-items-center gap-3">
        <label class="d-flex align-items-center gap-1 text-secondary text-nowrap">
          <app-icon :name="IPhTextAa" />
          {{ t('projectViewEdit.users.create.fields.username.label') }}
        </label>
        <b-form-input
          v-model="username"
          :placeholder="t('projectViewEdit.users.create.fields.username.placeholder')"
          :disabled="saving"
          autofocus
        />
      </div>
      <div class="d-flex align-items-center gap-3">
        <label class="d-flex align-items-center gap-1 text-secondary text-nowrap">
          {{ t('projectViewEdit.users.create.fields.role.label') }}
        </label>
        <b-form-select
          v-model="selectedRole"
          :options="availableRoles"
          :disabled="saving"
        />
      </div>
    </div>
  </app-modal>
</template>

<script setup>
import { computed, ref } from 'vue'
import { AppIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import IPhTextAa from '~icons/ph/text-aa'
import IPhEnvelopeSimple from '~icons/ph/envelope-simple'
import IPhUser from '~icons/ph/user'
import IPhLock from '~icons/ph/lock'

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
const email = ref('')
const name = ref('')
const password = ref('')
const confirmPassword = ref('')
const selectedRole = ref(DEFAULT_ROLE)
const saving = ref(false)

const currentUserRole = computed(() => getRoleByProject(props.projectName))

const AUTH_MODE_PWD = ['form', 'basic']

const isPasswordProvider = computed(() =>
  AUTH_MODE_PWD.includes(core.config.get('auth'))
)

const availableRoles = computed(() =>
  Object.values(ROLE)
    .filter(role => (ROLE_HIERARCHY[currentUserRole.value] & ROLE_BIT[role]) !== 0)
    .sort((a, b) => ROLE_BIT[b] - ROLE_BIT[a])
    .map(role => ({ value: role, text: formatRole(t, role) }))
)

const passwordMismatch = computed(() =>
  confirmPassword.value.length > 0 && password.value !== confirmPassword.value
)

const isValid = computed(() => {
  if (!username.value.trim().length) return false
  if (!isPasswordProvider.value) return true
  return password.value.length > 0 && password.value === confirmPassword.value
})

function resetForm() {
  username.value = ''
  email.value = ''
  name.value = ''
  password.value = ''
  confirmPassword.value = ''
  selectedRole.value = DEFAULT_ROLE
}

async function createUser() {
  saving.value = true
  try {
    await core.api.createUser({
      login: username.value.trim(),
      email: email.value.trim(),
      name: name.value.trim(),
      ...(isPasswordProvider.value ? { password: password.value } : {}),
      provider: 'local',
      groups: [props.projectName]
    })
    await core.api.saveProjectPolicy('default', props.projectName, {
      user: username.value.trim(),
      role: selectedRole.value
    })
    emit('user:created', { name: username.value.trim(), role: selectedRole.value })
    resetForm()
    modelValue.value = false
  } catch (err) {
    const status = err?.response?.status ?? err?.request?.response?.status
    if (status === 409) {
      toast.error(t('projectViewEdit.users.create.saveErrorConflict'))
    } else {
      toast.error(t('projectViewEdit.users.create.saveError'))
    }
  } finally {
    saving.value = false
  }
}

defineExpose({ username, email, name, password, confirmPassword, selectedRole, isValid, isPasswordProvider, passwordMismatch, saving, createUser, availableRoles })
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
          <app-icon :name="IPhEnvelopeSimple" />
          {{ t('projectViewEdit.users.create.fields.email.label') }}
        </label>
        <b-form-input
          v-model="email"
          type="email"
          :placeholder="t('projectViewEdit.users.create.fields.email.placeholder')"
          :disabled="saving"
        />
      </div>
      <div class="d-flex align-items-center gap-3">
        <label class="d-flex align-items-center gap-1 text-secondary text-nowrap">
          <app-icon :name="IPhUser" />
          {{ t('projectViewEdit.users.create.fields.name.label') }}
        </label>
        <b-form-input
          v-model="name"
          :placeholder="t('projectViewEdit.users.create.fields.name.placeholder')"
          :disabled="saving"
        />
      </div>
      <div
        v-if="isPasswordProvider"
        class="d-flex align-items-center gap-3"
      >
        <label class="d-flex align-items-center gap-1 text-secondary text-nowrap">
          <app-icon :name="IPhLock" />
          {{ t('projectViewEdit.users.create.fields.password.label') }}
        </label>
        <b-form-input
          v-model="password"
          type="password"
          :placeholder="t('projectViewEdit.users.create.fields.password.placeholder')"
          :disabled="saving"
        />
      </div>
      <div
        v-if="isPasswordProvider"
        class="d-flex flex-column gap-1"
      >
        <div class="d-flex align-items-center gap-3">
          <label class="d-flex align-items-center gap-1 text-secondary text-nowrap">
            <app-icon :name="IPhLock" />
            {{ t('projectViewEdit.users.create.fields.confirmPassword.label') }}
          </label>
          <b-form-input
            v-model="confirmPassword"
            type="password"
            :placeholder="t('projectViewEdit.users.create.fields.confirmPassword.placeholder')"
            :disabled="saving"
            :state="confirmPassword.length > 0 ? !passwordMismatch : null"
          />
        </div>
        <small
          v-if="passwordMismatch"
          class="text-danger ms-auto"
        >
          {{ t('projectViewEdit.users.create.fields.confirmPassword.mismatch') }}
        </small>
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

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import IPhTextAa from '~icons/ph/text-aa'
import IPhEnvelopeSimple from '~icons/ph/envelope-simple'
import IPhUser from '~icons/ph/user'
import IPhLock from '~icons/ph/lock'

import image from '@/assets/images/illustrations/app-modal-default-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-default-dark.svg'
import AppModal from '@/components/AppModal/AppModal.vue'

import { useAuth } from '@/composables/useAuth.js'
import { useCore } from '@/composables/useCore.js'
import { usePolicies } from '@/composables/usePolicies.js'
import { useToast } from '@/composables/useToast.js'
import { DEFAULT_ROLE, ROLE, ROLE_BIT, ROLE_HIERARCHY } from '@/enums/roles.js'
import FormFieldsetI18n from '@/components/Form/FormFieldset/FormFieldsetI18n.vue'
import { BFormInput } from 'bootstrap-vue-next'

const props = defineProps({
  project: {
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
const { isUsersProvider } = useAuth()

const username = ref('')
const email = ref('')
const name = ref('')
const password = ref('')
const confirmPassword = ref('')
const selectedRole = ref(DEFAULT_ROLE)
const saving = ref(false)

const currentUserRole = computed(() => getRoleByProject(props.project))

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
  if (!isUsersProvider.value) return true
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

const DEFAULT_DOMAIN = 'default'
const createUser = () => {
  return core.api.createUser({
    login: username.value.trim(),
    email: email.value.trim(),
    name: name.value.trim(),
    provider: 'external',
    ...(isUsersProvider.value ? { password: password.value } : {}),
    domain: DEFAULT_DOMAIN,
    index: props.project
  })
}

const saveProjectPolicy = () => {
  return core.api.saveProjectPolicy(DEFAULT_DOMAIN, props.project, {
    user: username.value.trim(),
    role: selectedRole.value
  })
}

async function saveUser() {
  saving.value = true
  try {
    await createUser()
    await saveProjectPolicy()
    emit('user:created', { login: username.value.trim(), role: selectedRole.value })
    resetForm()
    modelValue.value = false
  }
  catch (err) {
    const status = err?.response?.status ?? err?.request?.response?.status
    if (status === 409) {
      toast.error(t('projectViewEdit.users.create.saveErrorConflict'))
    }
    else {
      toast.error(t('projectViewEdit.users.create.saveError'))
    }
  }
  finally {
    saving.value = false
  }
}
const labelCol = 4
defineExpose({ username, email, name, password, confirmPassword, selectedRole, isValid, isUsersProvider, passwordMismatch, saving, saveUser, availableRoles })
</script>

<template>
  <app-modal
    v-model="modelValue"
    :image="image"
    :image-dark="imageDark"
    :title="t('projectViewEdit.users.create.title')"
    :ok-title="t('projectViewEdit.users.create.confirm')"
    :ok-disabled="!isValid || saving"
    size="lg"
    @ok="saveUser"
  >
    <form-fieldset-i18n
      :label-cols-sm="labelCol"
      :label-cols-md="labelCol"
      :label-cols-lg="labelCol"
      required
      name="uid"
      translation-key="projectViewEdit.users.create.fields.username"
      :icon="IPhTextAa"
    >
      <b-form-input
        v-model="username"
        :placeholder="t('projectViewEdit.users.create.fields.username.placeholder')"
        :disabled="saving"
        autofocus
        name="uid"
      />
    </form-fieldset-i18n>

    <form-fieldset-i18n
      :label-cols-sm="labelCol"
      :label-cols-md="labelCol"
      :label-cols-lg="labelCol"
      required
      name="email"
      translation-key="projectViewEdit.users.create.fields.email"
      :icon="IPhEnvelopeSimple"
    >
      <b-form-input
        v-model="email"
        :placeholder="t('projectViewEdit.users.create.fields.email.placeholder')"
        :disabled="saving"
        type="email"
        name="email"
      />
    </form-fieldset-i18n>

    <form-fieldset-i18n
      :label-cols-sm="labelCol"
      :label-cols-md="labelCol"
      :label-cols-lg="labelCol"
      required

      name="name"
      translation-key="projectViewEdit.users.create.fields.name"
      :icon="IPhUser"
    >
      <b-form-input
        v-model="name"
        :placeholder="t('projectViewEdit.users.create.fields.name.placeholder')"
        :disabled="saving"
        name="name"
      />
    </form-fieldset-i18n>

    <form-fieldset-i18n

      :label-cols-sm="labelCol"
      :label-cols-md="labelCol"
      :label-cols-lg="labelCol"
      required
      name="password"
      translation-key="projectViewEdit.users.create.fields.password"
      :icon="IPhLock"
    >
      <b-form-input
        v-model="password"
        :placeholder="t('projectViewEdit.users.create.fields.password.placeholder')"
        :disabled="saving"
        name="password"
      />
    </form-fieldset-i18n>
    <form-fieldset-i18n

      :label-cols-sm="labelCol"
      :label-cols-md="labelCol"
      :label-cols-lg="labelCol"
      required
      name="confirmPassword"
      translation-key="projectViewEdit.users.create.fields.confirmPassword"
      :icon="IPhLock"
    >
      <b-form-input
        v-model="confirmPassword"
        :placeholder="t('projectViewEdit.users.create.fields.confirmPassword.placeholder')"
        :disabled="saving"
        name="confirmPassword"
        :state="confirmPassword.length > 0 ? !passwordMismatch : null"
      />
      <small
        v-if="passwordMismatch"
        class="text-danger ms-auto"
      >
        {{ t('projectViewEdit.users.create.fields.confirmPassword.mismatch') }}
      </small>
    </form-fieldset-i18n>
    <form-fieldset-i18n

      :label-cols-sm="labelCol"
      :label-cols-md="labelCol"
      :label-cols-lg="labelCol"
      name="role"
      translation-key="projectViewEdit.users.create.fields.role"
    >
      <b-form-select
        v-model="selectedRole"
        :options="availableRoles"
        :disabled="saving"
      />
    </form-fieldset-i18n>
  </app-modal>
</template>

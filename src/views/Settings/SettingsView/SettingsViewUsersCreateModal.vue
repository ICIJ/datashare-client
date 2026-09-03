<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { BCollapse, BFormInput } from 'bootstrap-vue-next'

import IPhTextAa from '~icons/ph/text-aa'
import IPhEnvelopeSimple from '~icons/ph/envelope-simple'
import IPhUser from '~icons/ph/user'
import IPhLock from '~icons/ph/lock'

import image from '@/assets/images/illustrations/app-modal-default-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-default-dark.svg'
import AppModal from '@/components/AppModal/AppModal.vue'
import FormFieldsetI18n from '@/components/Form/FormFieldset/FormFieldsetI18n.vue'
import FormInputPassword from '@/components/Form/FormInputPassword.vue'
import ProjectDropdownSelector from '@/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.vue'
import ProjectUsersRoleDropdown from '@/components/ProjectUsers/ProjectUsersRoleDropdown.vue'

import { useCore } from '@/composables/useCore.js'
import { useToast } from '@/composables/useToast.js'
import { DEFAULT_ROLE, ROLE, ROLE_LOWERCASE } from '@/enums/roles.js'

const modelValue = defineModel({ type: Boolean })
const emit = defineEmits(['user:created'])

const core = useCore()
const { toast } = useToast()
const { t } = useI18n()

const username = ref('')
const email = ref('')
const name = ref('')
const password = ref('')
const confirmPassword = ref('')
const saving = ref(false)

const grantAccess = ref(false)
const selectedProject = ref(null)
const selectedRole = ref(DEFAULT_ROLE)

const allProjects = computed(() => core.projects)
const projectName = computed(() => selectedProject.value?.name ?? null)

const passwordMismatch = computed(() =>
  confirmPassword.value.length > 0 && password.value !== confirmPassword.value
)

const isValid = computed(() => {
  if (!username.value.trim().length) return false
  if (!email.value.trim().length) return false
  if (!name.value.trim().length) return false
  if (!password.value.trim().length) return false
  if (!confirmPassword.value.trim().length) return false
  if (password.value !== confirmPassword.value) return false
  if (grantAccess.value && !projectName.value) return false
  return true
})

function resetForm() {
  username.value = ''
  email.value = ''
  name.value = ''
  password.value = ''
  confirmPassword.value = ''
  grantAccess.value = false
  selectedProject.value = null
  selectedRole.value = DEFAULT_ROLE
}

const DEFAULT_DOMAIN = 'default'

const form = ref(null)
async function saveUser(bvModalEvent) {
  bvModalEvent?.preventDefault()
  if (!form.value.element.checkValidity()) {
    form.value.element.reportValidity()
    return
  }
  saving.value = true
  try {
    const uid = username.value.trim()
    await core.api.createUser({
      uid,
      email: email.value.trim(),
      name: name.value.trim(),
      provider: 'external',
      password: password.value,
      domain: DEFAULT_DOMAIN
    })
    if (grantAccess.value && projectName.value) {
      await core.api.grantUserRole(uid, projectName.value, ROLE_LOWERCASE[selectedRole.value])
    }
    toast.success(t('settings.users.create.saveSuccess'))
    emit('user:created', { uid })
    resetForm()
    modelValue.value = false
  }
  catch (err) {
    const status = err?.response?.status ?? err?.request?.response?.status
    if (status === 409) {
      toast.error(t('settings.users.create.saveErrorConflict'))
    }
    else {
      toast.error(t('settings.users.create.saveError'))
    }
  }
  finally {
    saving.value = false
  }
}
const labelCol = 4
defineExpose({
  username,
  email,
  name,
  password,
  confirmPassword,
  grantAccess,
  selectedProject,
  selectedRole,
  isValid,
  passwordMismatch,
  saving,
  saveUser,
  form
})
</script>

<template>
  <app-modal
    v-model="modelValue"
    :image="image"
    :image-dark="imageDark"
    :title="t('settings.users.create.title')"
    :ok-title="t('settings.users.create.confirm')"
    :ok-disabled="!isValid || saving"
    size="lg"
    @ok="saveUser"
  >
    <b-form ref="form">
      <form-fieldset-i18n
        :label-cols-sm="labelCol"
        :label-cols-md="labelCol"
        :label-cols-lg="labelCol"
        required
        name="uid"
        translation-key="settings.users.create.fields.username"
        :icon="IPhTextAa"
      >
        <b-form-input
          v-model="username"
          :placeholder="t('settings.users.create.fields.username.placeholder')"
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
        translation-key="settings.users.create.fields.email"
        :icon="IPhEnvelopeSimple"
      >
        <b-form-input
          v-model="email"
          :placeholder="t('settings.users.create.fields.email.placeholder')"
          :disabled="saving"
          aria-required="true"
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
        translation-key="settings.users.create.fields.name"
        :icon="IPhUser"
      >
        <b-form-input
          v-model="name"
          :placeholder="t('settings.users.create.fields.name.placeholder')"
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
        translation-key="settings.users.create.fields.password"
        :icon="IPhLock"
      >
        <form-input-password
          v-model="password"
          :placeholder="t('settings.users.create.fields.password.placeholder')"
          :disabled="saving"
          type="password"
          name="password"
        />
      </form-fieldset-i18n>
      <form-fieldset-i18n
        :label-cols-sm="labelCol"
        :label-cols-md="labelCol"
        :label-cols-lg="labelCol"
        required
        name="confirmPassword"
        translation-key="settings.users.create.fields.confirmPassword"
        :icon="IPhLock"
      >
        <form-input-password
          v-model="confirmPassword"
          :placeholder="t('settings.users.create.fields.confirmPassword.placeholder')"
          :disabled="saving"
          type="password"
          name="confirmPassword"
          :state="confirmPassword.length > 0 ? !passwordMismatch : null"
        />
        <small
          v-if="passwordMismatch"
          class="text-danger ms-auto"
        >
          {{ t('settings.users.create.fields.confirmPassword.mismatch') }}
        </small>
      </form-fieldset-i18n>

      <button
        type="button"
        class="btn btn-link ps-0"
        aria-controls="settings-users-create-modal-grant-access"
        :aria-expanded="grantAccess"
        @click="grantAccess = !grantAccess"
      >
        {{ t('settings.users.create.grantAccess') }}
      </button>
      <b-collapse
        id="settings-users-create-modal-grant-access"
        v-model="grantAccess"
      >
        <form-fieldset-i18n
          :label-cols-sm="labelCol"
          :label-cols-md="labelCol"
          :label-cols-lg="labelCol"
          name="project"
          translation-key="settings.users.create.fields.project"
        >
          <project-dropdown-selector
            v-model="selectedProject"
            :projects="allProjects"
          />
        </form-fieldset-i18n>
        <form-fieldset-i18n
          v-if="projectName"
          :label-cols-sm="labelCol"
          :label-cols-md="labelCol"
          :label-cols-lg="labelCol"
          name="role"
          translation-key="settings.users.create.fields.role"
        >
          <project-users-role-dropdown
            v-model="selectedRole"
            :project="projectName"
            :hidden-roles="[ROLE.DOMAIN_ADMIN, ROLE.INSTANCE_ADMIN]"
          />
        </form-fieldset-i18n>
      </b-collapse>
    </b-form>
  </app-modal>
</template>

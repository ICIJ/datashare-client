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
import ProjectUsersRoleDropdown from '@/components/ProjectUsers/ProjectUsersRoleDropdown.vue'

import { useCore } from '@/composables/useCore.js'
import { useToast } from '@/composables/useToast.js'
import { DEFAULT_ROLE, ROLE_ICON_DEFAULT, ROLE_LOWERCASE } from '@/enums/roles.js'
import FormFieldsetI18n from '@/components/Form/FormFieldset/FormFieldsetI18n.vue'
import { BFormInput } from 'bootstrap-vue-next'
import ProjectLabel from '@/components/Project/ProjectLabel.vue'
import FormInputPassword from '@/components/Form/FormInputPassword.vue'

const props = defineProps({
  project: {
    type: String,
    required: true
  }
})

const modelValue = defineModel({ type: Boolean })
const emit = defineEmits(['user:created'])

const { toast } = useToast()
const { t } = useI18n()

const username = ref('')
const email = ref('')
const name = ref('')
const password = ref('')
const confirmPassword = ref('')
const selectedRole = ref(DEFAULT_ROLE)
const saving = ref(false)

const passwordMismatch = computed(() =>
  confirmPassword.value.length > 0 && password.value !== confirmPassword.value
)

const isValid = computed(() => {
  if (!username.value.trim().length) return false
  if (!email.value.trim().length) return false
  if (!name.value.trim().length) return false
  if (!password.value.trim().length) return false
  if (!confirmPassword.value.trim().length) return false
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

const form = ref(null)
async function saveUser(bvModalEvent) {
  bvModalEvent?.preventDefault()
  if (!form.value.element.checkValidity()) {
    form.value.element.reportValidity()
    return
  }
  saving.value = true
  try {
    emit('user:created', {
      uid: username.value.trim(),
      email: email.value.trim(),
      name: name.value.trim(),
      password: password.value,
      domain: DEFAULT_DOMAIN,
      index: props.project,
      role: ROLE_LOWERCASE[selectedRole.value]
    })
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
defineExpose({ username, email, name, password, confirmPassword, selectedRole, isValid, passwordMismatch, saving, saveUser, form })
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
    <b-form ref="form">
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
        <form-input-password
          v-model="password"
          :placeholder="t('projectViewEdit.users.create.fields.password.placeholder')"
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
        translation-key="projectViewEdit.users.create.fields.confirmPassword"
        :icon="IPhLock"
      >
        <form-input-password
          v-model="confirmPassword"
          :placeholder="t('projectViewEdit.users.create.fields.confirmPassword.placeholder')"
          :disabled="saving"
          type="password"
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
        :icon="ROLE_ICON_DEFAULT"
        name="role"
        translation-key="projectViewEdit.users.create.fields.role"
      >
        <div class="d-flex align-items-center gap-2">
          <project-users-role-dropdown
            v-model="selectedRole"
            :project="project"
          />
          <i18n-t keypath="projectViewEdit.users.create.fields.role.inProject">
            <template #project>
              <project-label :project="project" />
            </template>
          </i18n-t>
        </div>
      </form-fieldset-i18n>
    </b-form>
  </app-modal>
</template>

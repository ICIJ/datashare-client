<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { BFormCheckbox, BFormInput } from 'bootstrap-vue-next'

import IPhTextAa from '~icons/ph/text-aa'
import IPhEnvelopeSimple from '~icons/ph/envelope-simple'
import IPhUser from '~icons/ph/user'
import IPhLock from '~icons/ph/lock'

import image from '@/assets/images/illustrations/app-modal-default-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-default-dark.svg'
import AppModal from '@/components/AppModal/AppModal.vue'
import DisplayUser from '@/components/Display/DisplayUser.vue'
import FormFieldsetI18n from '@/components/Form/FormFieldset/FormFieldsetI18n.vue'
import FormInputPassword from '@/components/Form/FormInputPassword.vue'
import SettingsViewUsersNotFound from '@/views/Settings/SettingsView/SettingsViewUsersNotFound.vue'
import { useCore } from '@/composables/useCore.js'
import { usePasswordConfirm } from '@/composables/usePasswordConfirm.js'
import { useToast } from '@/composables/useToast.js'

const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  // Set when the modal was opened from a URL naming a user that doesn't exist.
  notFound: {
    type: Boolean
  }
})

const modelValue = defineModel({ type: Boolean })
const emit = defineEmits(['user:updated'])

const core = useCore()
const { toast } = useToast()
const { t } = useI18n()

const name = ref('')
const email = ref('')
const resetPassword = ref(false)
// Native checkValidity() already blocks the save on a malformed email (type="email"), but that
// only surfaces as a browser tooltip - nothing in the page itself says why. This mirrors it
// visibly, same pattern as the password-mismatch message below.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const emailInvalid = computed(() => email.value.trim().length > 0 && !EMAIL_PATTERN.test(email.value.trim()))
const { password, confirmPassword, passwordMismatch, isPasswordValid, clearPasswords } = usePasswordConfirm()
const saving = ref(false)

function prefill(user) {
  name.value = user.name ?? ''
  email.value = user.email ?? ''
  resetPassword.value = false
  clearPasswords()
}

watch(() => props.user, prefill, { immediate: true })
watch(modelValue, (value) => {
  if (value) prefill(props.user)
})
// Unticking "Reset password" clear what was typed
watch(resetPassword, (value) => {
  if (!value) clearPasswords()
})

const isValid = computed(() => {
  if (!name.value.trim().length) return false
  if (!email.value.trim().length) return false
  return !resetPassword.value || isPasswordValid.value
})

const changes = computed(() => {
  const data = {}
  if (name.value.trim() !== (props.user.name ?? '')) data.name = name.value.trim()
  if (email.value.trim() !== (props.user.email ?? '')) data.email = email.value.trim()
  if (resetPassword.value) data.password = password.value
  return data
})
const hasChanges = computed(() => Object.keys(changes.value).length > 0)

const form = ref(null)
async function saveUser(bvModalEvent) {
  bvModalEvent?.preventDefault()
  if (!hasChanges.value) return
  if (!form.value.element.checkValidity()) {
    form.value.element.reportValidity()
    return
  }
  saving.value = true
  try {
    await core.api.updateUser(props.user.uid, changes.value)
    toast.success(t('settings.users.edit.saveSuccess'))
    emit('user:updated', { uid: props.user.uid })
    modelValue.value = false
  }
  catch {
    toast.error(t('settings.users.edit.saveError'))
  }
  finally {
    saving.value = false
  }
}
const labelCol = 4
defineExpose({
  name,
  email,
  resetPassword,
  password,
  confirmPassword,
  isValid,
  hasChanges,
  emailInvalid,
  saveUser,
  form
})
</script>

<template>
  <app-modal
    v-model="modelValue"
    :image="image"
    :image-dark="imageDark"
    :title="t('settings.users.edit.title', { uid: user.uid })"
    :ok-title="t('settings.users.edit.confirm')"
    :ok-disabled="notFound || !isValid || !hasChanges || saving"
    size="lg"
    @ok="saveUser"
  >
    <template #title>
      <i18n-t
        keypath="settings.users.edit.title"
        tag="span"
        class="d-inline-flex align-items-center gap-1"
      >
        <template #uid>
          <display-user
            v-if="user.uid"
            :value="user.uid"
          />
        </template>
      </i18n-t>
    </template>

    <settings-view-users-not-found
      v-if="notFound"
      :uid="user.uid"
    />
    <b-form
      v-else
      ref="form"
    >
      <form-fieldset-i18n
        :label-cols-sm="labelCol"
        :label-cols-md="labelCol"
        :label-cols-lg="labelCol"
        name="uid"
        translation-key="settings.users.edit.fields.username"
        :icon="IPhTextAa"
      >
        <b-form-input
          :model-value="user.uid"
          disabled
          name="uid"
        />
      </form-fieldset-i18n>

      <form-fieldset-i18n
        :label-cols-sm="labelCol"
        :label-cols-md="labelCol"
        :label-cols-lg="labelCol"
        required
        name="name"
        translation-key="settings.users.edit.fields.name"
        :icon="IPhUser"
      >
        <b-form-input
          v-model="name"
          :placeholder="t('settings.users.edit.fields.name.placeholder')"
          :disabled="saving"
          autofocus
          name="name"
        />
      </form-fieldset-i18n>

      <form-fieldset-i18n
        :label-cols-sm="labelCol"
        :label-cols-md="labelCol"
        :label-cols-lg="labelCol"
        required
        name="email"
        translation-key="settings.users.edit.fields.email"
        :icon="IPhEnvelopeSimple"
      >
        <b-form-input
          v-model="email"
          :placeholder="t('settings.users.edit.fields.email.placeholder')"
          :disabled="saving"
          :state="emailInvalid ? false : null"
          aria-required="true"
          type="email"
          name="email"
        />
        <small
          v-if="emailInvalid"
          class="text-danger"
        >
          {{ t('settings.users.edit.fields.email.invalid') }}
        </small>
      </form-fieldset-i18n>

      <b-form-checkbox
        v-model="resetPassword"
        :disabled="saving"
        class="mb-2"
      >
        {{ t('settings.users.edit.resetPassword') }}
      </b-form-checkbox>

      <template v-if="resetPassword">
        <form-fieldset-i18n
          :label-cols-sm="labelCol"
          :label-cols-md="labelCol"
          :label-cols-lg="labelCol"
          required
          name="password"
          translation-key="settings.users.edit.fields.password"
          :icon="IPhLock"
        >
          <form-input-password
            v-model="password"
            :placeholder="t('settings.users.edit.fields.password.placeholder')"
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
          translation-key="settings.users.edit.fields.confirmPassword"
          :icon="IPhLock"
        >
          <form-input-password
            v-model="confirmPassword"
            :placeholder="t('settings.users.edit.fields.confirmPassword.placeholder')"
            :disabled="saving"
            type="password"
            name="confirmPassword"
            :state="confirmPassword.length > 0 ? !passwordMismatch : null"
          />
          <small
            v-if="passwordMismatch"
            class="text-danger ms-auto"
          >
            {{ t('settings.users.edit.fields.confirmPassword.mismatch') }}
          </small>
        </form-fieldset-i18n>
      </template>
    </b-form>
  </app-modal>
</template>

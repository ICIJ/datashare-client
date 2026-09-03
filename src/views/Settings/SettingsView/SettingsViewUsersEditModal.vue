<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { BFormCheckbox, BFormInput } from 'bootstrap-vue-next'

import IPhEnvelopeSimple from '~icons/ph/envelope-simple'
import IPhUser from '~icons/ph/user'
import IPhLock from '~icons/ph/lock'

import image from '@/assets/images/illustrations/app-modal-default-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-default-dark.svg'
import AppModal from '@/components/AppModal/AppModal.vue'
import FormFieldsetI18n from '@/components/Form/FormFieldset/FormFieldsetI18n.vue'
import FormInputPassword from '@/components/Form/FormInputPassword.vue'
import { useCore } from '@/composables/useCore.js'
import { useToast } from '@/composables/useToast.js'

const props = defineProps({
  user: {
    type: Object,
    default: () => null
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
const password = ref('')
const confirmPassword = ref('')
const saving = ref(false)

function prefill(user) {
  name.value = user?.name ?? ''
  email.value = user?.email ?? ''
  resetPassword.value = false
  password.value = ''
  confirmPassword.value = ''
}

watch(() => props.user, prefill, { immediate: true })
watch(modelValue, (value) => {
  if (value) prefill(props.user)
})

const passwordMismatch = computed(() =>
  confirmPassword.value.length > 0 && password.value !== confirmPassword.value
)

const isValid = computed(() => {
  if (!name.value.trim().length) return false
  if (!email.value.trim().length) return false
  if (resetPassword.value) {
    if (!password.value.trim().length) return false
    if (!confirmPassword.value.trim().length) return false
    if (password.value !== confirmPassword.value) return false
  }
  return true
})

const form = ref(null)
async function saveUser(bvModalEvent) {
  bvModalEvent?.preventDefault()
  if (!form.value.element.checkValidity()) {
    form.value.element.reportValidity()
    return
  }
  saving.value = true
  try {
    const data = {}
    if (name.value.trim() !== (props.user?.name ?? '')) data.name = name.value.trim()
    if (email.value.trim() !== (props.user?.email ?? '')) data.email = email.value.trim()
    if (resetPassword.value) data.password = password.value
    await core.api.updateUser(props.user.uid, data)
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
    :title="t('settings.users.edit.title')"
    :ok-title="t('settings.users.edit.confirm')"
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
          aria-required="true"
          type="email"
          name="email"
        />
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

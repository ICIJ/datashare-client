<script setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'
import IPhSignIn from '~icons/ph/sign-in'

const { t } = useI18n()

defineProps({
  error: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit'])

const form = reactive({
  username: '',
  password: ''
})

function submit() {
  emit('submit', { ...form })
}
</script>

<template>
  <b-form
    class="login-card-form d-flex flex-column gap-3"
    @submit.stop.prevent="submit"
  >
    <div
      v-if="error"
      class="login-card-form__error alert alert-danger mb-0"
    >
      {{ t('login.error') }}
    </div>
    <b-form-group
      :label="t('login.username')"
      label-for="login-username"
    >
      <b-form-input
        id="login-username"
        v-model="form.username"
        name="username"
        type="text"
        required
        autofocus
        :disabled="disabled"
      />
    </b-form-group>
    <b-form-group
      :label="t('login.password')"
      label-for="login-password"
    >
      <b-form-input
        id="login-password"
        v-model="form.password"
        name="password"
        type="password"
        required
        :disabled="disabled"
      />
    </b-form-group>
    <div class="login-card-form__actions d-flex align-items-center justify-content-between gap-3">
      <slot name="actions" />
      <button-icon
        type="submit"
        class="login-card-form__submit"
        :label="t('login.submit')"
        :icon-left="IPhSignIn"
        variant="action"
        :disabled="disabled"
      />
    </div>
  </b-form>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import image from '@/assets/images/illustrations/app-modal-default-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-default-dark.svg'
import AppModal from '@/components/AppModal/AppModal.vue'

import { useCore } from '@/composables/useCore.js'
import { useToast } from '@/composables/useToast.js'

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

const modelValue = defineModel({ type: Boolean })

const emit = defineEmits(['user:deleted'])

const core = useCore()
const { toast } = useToast()
const { t } = useI18n()

const AUTH_MODE_PWD = ['form', 'basic']
const isPasswordProvider = computed(() => AUTH_MODE_PWD.includes(core.config.get('auth')))

async function confirmDeletion() {
  try {
    if (isPasswordProvider.value) {
      await core.api.deleteUser(props.user.name)
    } else {
      await core.api.removeProjectPolicy('default', props.projectName, { user: props.user.name })
    }
    emit('user:deleted', { name: props.user.name })
    modelValue.value = false
  }
  catch {
    toast.error(t('projectViewEdit.users.actions.deleteModal.error'))
  }
}

defineExpose({ confirmDeletion, isPasswordProvider })
</script>

<template>
  <app-modal
    v-model="modelValue"
    :image="image"
    :image-dark="imageDark"
    :ok-title="t('projectViewEdit.users.actions.deleteModal.confirm')"
    ok-variant="primary"
    @ok="confirmDeletion"
  >
    <template #title>
      <i18n-t keypath="projectViewEdit.users.actions.deleteModal.title">
        <template #name>
          {{ user.name }}
        </template>
      </i18n-t>
    </template>
    {{ t('projectViewEdit.users.actions.deleteModal.body') }}
  </app-modal>
</template>

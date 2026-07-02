<script setup>
import { useI18n } from 'vue-i18n'

import image from '@/assets/images/illustrations/app-modal-default-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-default-dark.svg'
import AppModal from '@/components/AppModal/AppModal.vue'

import { useAuth } from '@/composables/useAuth.js'
import { useCore } from '@/composables/useCore.js'
import { useToast } from '@/composables/useToast.js'

const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  project: {
    type: String,
    required: true
  }
})

const modelValue = defineModel({ type: Boolean })

const emit = defineEmits(['user:deleted'])

const core = useCore()
const { toast } = useToast()
const { t } = useI18n()
const { isUsersProvider } = useAuth()

const DEFAULT_DOMAIN = 'default'
async function confirmDeletion() {
  try {
    if (isUsersProvider.value) {
      await core.api.deleteUser(props.user.name, { domain: DEFAULT_DOMAIN, index: props.project })
    }
    else {
      await core.api.removeProjectPolicy('default', props.project, { user: props.user.name })
    }
    emit('user:deleted', { name: props.user.name })
    modelValue.value = false
    toast.success(t('projectViewEdit.users.actions.deleteModal.success'))
  }
  catch {
    toast.error(t('projectViewEdit.users.actions.deleteModal.error'))
  }
}

defineExpose({ confirmDeletion, isUsersProvider })
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

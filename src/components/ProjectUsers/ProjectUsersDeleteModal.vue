<script setup>
import { useI18n } from 'vue-i18n'

import image from '@/assets/images/illustrations/app-modal-default-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-default-dark.svg'
import AppModal from '@/components/AppModal/AppModal.vue'

import { useAuth } from '@/composables/useAuth.js'
import { useCore } from '@/composables/useCore.js'
import { useToast } from '@/composables/useToast.js'
import { computed } from 'vue'

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
const deletionSuccessMessage = computed(() => t('projectViewEdit.users.actions.deleteModal.success'))
const deletionErrorMessage = computed(() => t('projectViewEdit.users.actions.deleteModal.error'))
const deleteModalTitle = computed(() => t('projectViewEdit.users.actions.deleteModal.title', { name: props.user.login }))
const deleteModalBody = computed(() => t('projectViewEdit.users.actions.deleteModal.body'))

const DEFAULT_DOMAIN = 'default'
async function confirmDeletion() {
  try {
    if (isUsersProvider.value) {
      await core.api.deleteUser(props.user.login, { domain: DEFAULT_DOMAIN, index: props.project })
    }
    else {
      await core.api.revokeUserRole(props.user.login, props.project)
    }
    emit('user:deleted', { login: props.user.login })
    modelValue.value = false
    toast.success(deletionSuccessMessage.value)
  }
  catch {
    toast.error(deletionErrorMessage.value)
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
      {{ deleteModalTitle }}
    </template>
    {{ deleteModalBody }}
  </app-modal>
</template>

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
  }
})

const modelValue = defineModel({ type: Boolean })

const emit = defineEmits(['user:deleted'])

const core = useCore()
const { toast } = useToast()
const { t } = useI18n()
const deletionSuccessMessage = computed(() => t('settings.users.deleteModal.success'))
const deletionErrorMessage = computed(() => t('settings.users.deleteModal.error'))
const deleteModalTitle = computed(() => t('settings.users.deleteModal.title', { name: props.user.uid }))

async function confirmDeletion() {
  try {
    await core.api.deleteUser(props.user.uid)
    emit('user:deleted', { uid: props.user.uid })
    modelValue.value = false
    toast.success(deletionSuccessMessage.value)
  }
  catch {
    toast.error(deletionErrorMessage.value)
  }
}

defineExpose({ confirmDeletion })
</script>

<template>
  <app-modal
    v-model="modelValue"
    :image="image"
    :image-dark="imageDark"
    :ok-title="t('settings.users.deleteModal.confirm')"
    ok-variant="danger"
    @ok="confirmDeletion"
  >
    <template #title>
      {{ deleteModalTitle }}
    </template>
    <p>
      {{ t('settings.users.deleteModal.body.intro') }}
    </p>
    <ul>
      <li>
        {{ t('settings.users.deleteModal.body.rolesRevoked') }}
      </li>
      <li>
        {{ t('settings.users.deleteModal.body.dataDeleted') }}
      </li>
      <li>
        {{ t('settings.users.deleteModal.body.tasksDeleted') }}
      </li>
    </ul>
  </app-modal>
</template>

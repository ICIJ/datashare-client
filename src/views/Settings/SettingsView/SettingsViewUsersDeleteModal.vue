<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import image from '@/assets/images/illustrations/app-modal-default-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-default-dark.svg'
import AppModal from '@/components/AppModal/AppModal.vue'
import DisplayUser from '@/components/Display/DisplayUser.vue'
import SettingsViewUsersNotFound from '@/views/Settings/SettingsView/SettingsViewUsersNotFound.vue'

import { useCore } from '@/composables/useCore.js'
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

const emit = defineEmits(['user:deleted'])

const core = useCore()
const { toast } = useToast()
const { t } = useI18n()
const deletionSuccessMessage = computed(() => t('settings.users.deleteModal.success'))
const deletionErrorMessage = computed(() => t('settings.users.deleteModal.error'))

async function confirmDeletion() {
  // The modal closes (and the routed user goes away) while the request is pending
  const { uid } = props.user
  try {
    await core.api.deleteUser(uid)
    emit('user:deleted', { uid })
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
    :ok-disabled="notFound"
    @ok="confirmDeletion"
  >
    <template #title>
      <i18n-t
        keypath="settings.users.deleteModal.title"
        tag="span"
        class="d-inline-flex align-items-center gap-1"
      >
        <template #name>
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
    <p v-else>
      {{ t('settings.users.deleteModal.body.intro') }}
    </p>
    <ul v-if="!notFound">
      <i18n-t
        keypath="settings.users.deleteModal.body.rolesRevoked"
        tag="li"
      >
        <template #verb>
          <strong>{{ t('settings.users.deleteModal.body.rolesRevokedVerb') }}</strong>
        </template>
      </i18n-t>
      <i18n-t
        keypath="settings.users.deleteModal.body.dataDeleted"
        tag="li"
      >
        <template #verb>
          <strong>{{ t('settings.users.deleteModal.body.dataDeletedVerb') }}</strong>
        </template>
      </i18n-t>
      <i18n-t
        keypath="settings.users.deleteModal.body.tasksKept"
        tag="li"
      >
        <template #verb>
          <strong>{{ t('settings.users.deleteModal.body.tasksKeptVerb') }}</strong>
        </template>
      </i18n-t>
    </ul>
  </app-modal>
</template>

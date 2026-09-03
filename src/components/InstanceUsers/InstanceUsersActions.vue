<script setup>
import { computed, ref } from 'vue'

import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete.vue'
import ButtonRowActionEdit from '@/components/Button/ButtonRowAction/ButtonRowActionEdit.vue'
import ButtonRowActionRoles from '@/components/Button/ButtonRowAction/ButtonRowActionRoles.vue'
import SettingsViewUsersDeleteModal from '@/views/Settings/SettingsView/SettingsViewUsersDeleteModal.vue'
import SettingsViewUsersEditModal from '@/views/Settings/SettingsView/SettingsViewUsersEditModal.vue'
import SettingsViewUsersRolesModal from '@/views/Settings/SettingsView/SettingsViewUsersRolesModal.vue'

import useAuth from '@/composables/useAuth.js'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['user:updated', 'user:deleted'])

const { username, isUsernameResolved, isAuthWithUsersProvider } = useAuth()
const isCurrentUser = computed(() => !isUsernameResolved.value || username.value === props.user.uid)
// Editing/deleting an account only makes sense when datashare owns the credentials (form/basic
// auth); under OAuth, accounts are provisioned by the identity provider. Explicit here even
// though the whole page is already gated the same way, so this component is safe on its own.
const canManageAccount = computed(() => isAuthWithUsersProvider.value)

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showRolesModal = ref(false)

function onUserUpdated({ uid }) {
  emit('user:updated', { uid })
}

function onUserDeleted({ uid }) {
  emit('user:deleted', { uid })
}
</script>

<template>
  <div class="instance-users-actions d-inline-flex gap-1">
    <button-row-action-roles @click="showRolesModal = true" />
    <button-row-action-edit
      v-if="canManageAccount"
      @click="showEditModal = true"
    />
    <button-row-action-delete
      v-if="canManageAccount"
      :disabled="isCurrentUser"
      @click="showDeleteModal = true"
    />
    <settings-view-users-roles-modal
      v-model="showRolesModal"
      :user="user"
      @user:updated="onUserUpdated"
    />
    <settings-view-users-edit-modal
      v-if="canManageAccount"
      v-model="showEditModal"
      :user="user"
      @user:updated="onUserUpdated"
    />
    <settings-view-users-delete-modal
      v-if="canManageAccount"
      v-model="showDeleteModal"
      :user="user"
      @user:deleted="onUserDeleted"
    />
  </div>
</template>

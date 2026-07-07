<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import IPhClipboard from '~icons/ph/clipboard'
import IPhTrash from '~icons/ph/trash'

import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction.vue'
import ProjectUsersDeleteModal from '@/components/ProjectUsers/ProjectUsersDeleteModal.vue'

import { useAuth } from '@/composables/useAuth.js'
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

const emit = defineEmits(['user:deleted'])

const { toast } = useToast()
const { t } = useI18n()
const { username, isUsersProvider } = useAuth()

const showDeleteModal = ref(false)
const isCurrentUser = computed(() => username.value === props.user.login)

const copySuccessText = computed(() => t('projectViewEdit.users.actions.copySuccess'))
const copyActionText = computed(() => t('projectViewEdit.users.actions.copy'))
const deleteActionText = computed(() => t('projectViewEdit.users.actions.delete'))
async function copyUsername() {
  await navigator.clipboard.writeText(props.user.login)
  toast.success(copySuccessText.value)
}

function onUserDeleted({ login }) {
  emit('user:deleted', { login })
}
</script>

<template>
  <div class="project-users-actions d-inline-flex gap-1">
    <button-row-action
      :icon="IPhClipboard"
      :label="copyActionText"
      @click="copyUsername"
    />
    <button-row-action
      v-if="isUsersProvider"
      :icon="IPhTrash"
      :label="deleteActionText"
      :disabled="isCurrentUser"
      @click="showDeleteModal = true"
    />
    <project-users-delete-modal
      v-model="showDeleteModal"
      :user="user"
      :project="project"
      @user:deleted="onUserDeleted"
    />
  </div>
</template>

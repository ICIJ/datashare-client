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
const isCurrentUser = computed(() => username.value === props.user.name)

async function copyUsername() {
  await navigator.clipboard.writeText(props.user.name)
  toast.success(t('projectViewEdit.users.actions.copySuccess'))
}

function onUserDeleted({ name }) {
  emit('user:deleted', { name })
}
</script>

<template>
  <div class="project-users-actions d-inline-flex gap-1">
    <button-row-action
      :icon="IPhClipboard"
      :label="t('projectViewEdit.users.actions.copy')"
      @click="copyUsername"
    />
    <button-row-action
      v-if="isUsersProvider"
      :icon="IPhTrash"
      :label="t('projectViewEdit.users.actions.delete')"
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

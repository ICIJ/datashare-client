<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import IPhClipboard from '~icons/ph/clipboard'
import IPhTrash from '~icons/ph/trash'

import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction.vue'
import ProjectUsersDeleteModal from '@/components/ProjectUsers/ProjectUsersDeleteModal.vue'

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

const emit = defineEmits(['user:deleted'])

const { toast } = useToast()
const { t } = useI18n()

const showDeleteModal = ref(false)

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
      :icon="IPhTrash"
      :label="t('projectViewEdit.users.actions.delete')"
      @click="showDeleteModal = true"
    />
    <project-users-delete-modal
      v-model="showDeleteModal"
      :user="user"
      :project-name="projectName"
      @user:deleted="onUserDeleted"
    />
  </div>
</template>

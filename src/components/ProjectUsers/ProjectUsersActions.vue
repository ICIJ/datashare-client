<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { HapticCopy } from '@icij/murmur'

import IPhTrash from '~icons/ph/trash'

import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction.vue'
import ProjectUsersDeleteModal from '@/components/ProjectUsers/ProjectUsersDeleteModal.vue'

defineProps({
  user: {
    type: Object,
    required: true
  },
  project: {
    type: String,
    required: true
  },
  disableDelete: {
    type: Boolean,
    default: false
  },
  hideDelete: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['user:deleted'])

const { t } = useI18n()

const showDeleteModal = ref(false)

const copyActionText = computed(() => t('projectViewEdit.users.actions.copy'))
const deleteActionText = computed(() => t('projectViewEdit.users.actions.delete'))

function onUserDeleted({ uid }) {
  emit('user:deleted', { uid })
}
</script>

<template>
  <div class="project-users-actions d-inline-flex gap-1">
    <haptic-copy
      :tag="ButtonRowAction"
      :text="user.uid"
      :label="copyActionText"
      hide-label
    />
    <button-row-action
      v-if="!hideDelete"
      :icon="IPhTrash"
      :label="deleteActionText"
      :disabled="disableDelete"
      @click="showDeleteModal = true"
    />
    <project-users-delete-modal
      v-if="!hideDelete || disableDelete"
      v-model="showDeleteModal"
      :user="user"
      :project="project"
      @user:deleted="onUserDeleted"
    />
  </div>
</template>

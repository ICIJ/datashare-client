<script setup>
import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete.vue'
import ButtonRowActionEdit from '@/components/Button/ButtonRowAction/ButtonRowActionEdit.vue'
import ButtonRowActionRoles from '@/components/Button/ButtonRowAction/ButtonRowActionRoles.vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  canManageAccount: {
    type: Boolean
  },
  isCurrentUser: {
    type: Boolean
  }
})

const emit = defineEmits(['open'])

function open(action) {
  emit('open', { action, uid: props.user.uid })
}
</script>

<template>
  <div class="instance-users-actions d-inline-flex gap-1">
    <button-row-action-roles @click="open('manage')" />
    <button-row-action-edit
      v-if="canManageAccount"
      @click="open('edit')"
    />
    <button-row-action-delete
      v-if="canManageAccount"
      :disabled="isCurrentUser"
      @click="open('delete')"
    />
  </div>
</template>

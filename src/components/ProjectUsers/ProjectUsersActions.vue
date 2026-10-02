<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { HapticCopy } from '@icij/murmur'

import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction.vue'

defineProps({
  user: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()

const copyActionText = computed(() => t('projectViewEdit.users.actions.copy'))
</script>

<template>
  <div class="project-users-actions d-inline-flex gap-1">
    <haptic-copy
      :tag="ButtonRowAction"
      :text="user.uid"
      :label="copyActionText"
      hide-label
    />
  </div>
</template>

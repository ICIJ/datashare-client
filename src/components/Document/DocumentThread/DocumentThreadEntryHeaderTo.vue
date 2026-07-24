<script setup>
import { useI18n } from 'vue-i18n'

import DisplayEmail from '@/components/Display/DisplayEmail'

defineOptions({ name: 'DocumentThreadEntryHeaderTo' })

defineProps({
  email: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()
</script>

<template>
  <span class="document-thread-entry-header-to text-secondary">
    {{ t('documentThread.to') }}
    <ul class="list-inline d-inline">
      <li
        v-for="to in email.messageTo.split(',')"
        :key="to"
        class="list-inline-item"
      >
        <display-email :value="to" />
      </li>
    </ul>
  </span>
</template>

<style lang="scss" scoped>
.document-thread-entry-header-to {
  .list-inline-item {
    &:after {
      content: ', ';
    }

    &:last-of-type:after {
      content: '';
    }
  }
}
</style>

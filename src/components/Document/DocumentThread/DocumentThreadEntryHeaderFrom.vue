<script setup>
import DisplayEmail from '@/components/Display/DisplayEmail'

defineOptions({ name: 'DocumentThreadEntryHeaderFrom' })

defineProps({
  email: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="document-thread-entry-header-from flex-grow-1">
    <display-email
      :value="email.messageFrom"
      tag="strong"
    />
  </div>
</template>

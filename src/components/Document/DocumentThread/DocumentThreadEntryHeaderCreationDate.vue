<script setup>
import DisplayDatetimeLong from '@/components/Display/DisplayDatetimeLong.vue'

defineOptions({ name: 'DocumentThreadEntryHeaderCreationDate' })

defineProps({
  email: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <router-link
    v-if="email.creationDate"
    :to="{ name: 'document', params: email.routerParams }"
    class="document-thread-entry-header-creation-date text-secondary-emphasis"
    @click.stop
  >
    <display-datetime-long :value="email.creationDate" />
  </router-link>
</template>

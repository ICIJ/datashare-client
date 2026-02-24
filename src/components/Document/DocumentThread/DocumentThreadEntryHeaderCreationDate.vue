<script setup>
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'DocumentThreadEntryHeaderCreationDate' })

defineProps({
  email: {
    type: Object,
    required: true
  },
  tooltipDelay: {
    type: Object,
    default: () => ({ show: 0, hide: 0 })
  }
})

const { d } = useI18n()
</script>

<template>
  <router-link
    v-if="email.creationDate"
    v-b-tooltip.body="{ delay: tooltipDelay }"
    :to="{ name: 'document', params: email.routerParams }"
    class="document-thread-entry-header-creation-date"
    :title="email.creationDateHuman"
    @click.stop
  >
    {{ d(email.creationDate) }}
  </router-link>
</template>

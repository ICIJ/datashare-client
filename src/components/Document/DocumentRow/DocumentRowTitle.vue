<script setup>
import { computed } from 'vue'

import Hook from '@/components/Hook/Hook'

const props = defineProps({
  document: {
    type: Object
  }
})

const to = computed(() => {
  return { name: 'document', params: props.document.routerParams }
})
</script>

<template>
  <td>
    <hook
      name="document-row-title:before"
      :bind="{ document }"
    />
    <router-link
      :to="to"
      class="document-row-title fw-medium link-visitable stretched-link"
    >
      {{ document.title }}
    </router-link>
    <hook
      name="document-row-title:after"
      :bind="{ document }"
    />
  </td>
</template>

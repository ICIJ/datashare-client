<script setup>
import { computed } from 'vue'
import { basename } from 'path'

import RouterLinkDocument from '@/components/RouterLink/RouterLinkDocument'

const { item } = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const display = computed(() => basename(item.documentPath))
</script>

<template>
  <router-link-document
    :id="item.documentId"
    :index="item.project.name ?? item.project"
    :routing="item.rootId"
    :q="item.query"
  >
    {{ display }}
  </router-link-document>
</template>

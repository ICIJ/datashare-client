<script setup>
import EntityButton from '@/components/Entity/EntityButton'

defineOptions({
  name: 'EntitySectionListEntry'
})

defineProps({
  entity: {
    type: Object
  }
})
</script>

<template>
  <entity-button :entity="entity" />
</template>

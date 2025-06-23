<script setup>
import EntityButton from '@/components/Entity/EntityButton'
import EntityInContext from '@/components/Entity/EntityInContext'

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
  <entity-in-context lazy :click="false" :entity="entity">
    <template #target>
      <entity-button :entity="entity" clickable />
    </template>
  </entity-in-context>
</template>

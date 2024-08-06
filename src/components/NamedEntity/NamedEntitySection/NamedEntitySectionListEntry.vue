<script setup>
import NamedEntityButton from '@/components/NamedEntity/NamedEntityButton'

defineOptions({
  name: 'NamedEntitySectionListEntry'
})

defineProps({
  namedEntity: {
    type: Object
  }
})
</script>

<template>
  <named-entity-button :named-entity="namedEntity" />
</template>

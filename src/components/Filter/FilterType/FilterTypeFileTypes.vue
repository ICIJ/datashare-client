<script setup>
import ButtonToggleFileTypesGrouped from '@/components/Button/ButtonToggleFileTypesGrouped.vue'
import FileTypesView from '@/components/FileTypes/FileTypesView/FileTypesView.vue'
import FilterType from './FilterType.vue'
import { ref } from 'vue'
const props = defineProps({
  filter: {
    type: Object,
    required: true
  },
  hideCount: {
    type: Boolean
  }
})

const grouped = ref(false)

</script>

<template>
  <filter-type :filter="props.filter">
    <template
      #default="{ entries }"
    >
      <file-types-view
        :content-types="entries.map(entry => entry.item.key)"
        :expanded="!grouped"
      />
    </template>

    <template #actions>
      <button-toggle-file-types-grouped v-model:grouped="grouped" />
    </template>
  </filter-type>
</template>

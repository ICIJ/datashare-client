<script setup>
defineProps({
  query: {
    type: String,
    default: ''
  },
  hasMatches: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:model-value', 'blur', 'up', 'down', 'enter'])
</script>

<template>
  <li class="project-dropdown-selector-search">
    <div class="b-dropdown-form pt-1 mb-3">
      <search-form-control
        :model-value="query"
        autofocus
        shado
        placeholder="Search projects"
        @update:model-value="emit('update:model-value', $event)"
        @blur="emit('blur', $event)"
        @up="emit('up', $event)"
        @down="emit('down', $event)"
        @enter="emit('enter', $event)"
      />
    </div>
    <div v-if="!hasMatches" class="text-center small text-muted pb-2">
      {{ $t('searchBarInputDropdownForProjects.noMatches') }}
    </div>
  </li>
</template>

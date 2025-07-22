<script setup>
defineProps({
  options: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <b-dropdown
    :disabled="disabled"
    class="path-tree-breadcrumb-dropdown d-inline-block"
    menu-class="path-tree-breadcrumb-dropdown__menu"
    toggle-class="p-0 text-reset"
    no-caret
    teleport-to="body"
    variant="link"
  >
    <template #button-content>
      <phosphor-icon :name="PhDotsThree" weight="bold" />
    </template>
    <b-dropdown-item
      v-for="{ text, value } in options"
      :key="value"
      class="d-flex gap-2"
      @click="$emit('select', value)"
    >
      <phosphor-icon v-if="!compact" :name="PhFolder" class="flex-shrink-0" />
      {{ text }}
    </b-dropdown-item>
  </b-dropdown>
</template>

<style lang="scss">
.path-tree-breadcrumb-dropdown__menu {
  --bs-dropdown-zindex: #{$zindex-modal + 100};
}
</style>

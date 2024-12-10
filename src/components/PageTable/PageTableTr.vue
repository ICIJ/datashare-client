<script setup>
import { computed } from 'vue'

const selected = defineModel('selected', { type: Boolean })

const props = defineProps({
  emphasis: {
    type: Boolean
  },
  selectMode: {
    type: Boolean
  }
})

const classList = computed(() => {
  return {
    'page-table-tr--selected': props.selectMode && selected.value,
    'page-table-tr--emphasis': props.emphasis
  }
})
</script>

<template>
  <b-tr :class="classList" class="page-table-tr">
    <td v-show="selectMode" class="page-table-tr__select">
      <b-form-checkbox v-model="selected" />
    </td>
    <slot />
  </b-tr>
</template>

<style lang="scss">
.page-table-tr {
  border: none;
  border-left: 1px solid transparent;
  vertical-align: middle;

  &__select {
    width: 2rem;
    position: relative;

    .form-check-label {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: block;
    }
  }

  td {
    --box-shadow: inset 0 0 0 9999px var(--bs-table-bg-state, var(--bs-table-bg-type, var(--bs-table-accent-bg)));
    box-shadow: var(--box-shadow);
  }

  &--selected {
    // Due to CSS/HTML limitation, we draw the border of the selected
    // row using box-shadow on the `td` elements.
    --box-shadow-top: inset 0 1px 0 0 var(--bs-action-text-emphasis);
    --box-shadow-bottom: inset 0 -1px 0 0 var(--bs-action-text-emphasis);
    --box-shadow-y: var(--box-shadow-top), var(--box-shadow-bottom);
    --box-shadow-end: inset -1px 0 0 0 var(--bs-action-text-emphasis);
    // The border on the left doesn't use boxèshadow so it's visible
    // regardless of the presence of the `td.page-table-tr__select`
    // element.
    border-left: 1px solid var(--bs-action-text-emphasis);

    & > td {
      box-shadow: var(--box-shadow-y), var(--box-shadow);

      &:last-child {
        box-shadow: var(--box-shadow-y), var(--box-shadow-end), var(--box-shadow);
      }
    }

    & + & td {
      box-shadow: var(--box-shadow-bottom), var(--box-shadow);

      &:last-child {
        box-shadow: var(--box-shadow-bottom), var(--box-shadow-end), var(--box-shadow);
      }
    }
  }
}
</style>

<script setup>

import { AppIcon } from '@icij/murmur-next'
import { BDropdown, BDropdownItem } from 'bootstrap-vue-next'
import { computed } from 'vue'

import { useI18n } from 'vue-i18n'
import { VARIANT, variantOptions } from '@/enums/variants.js'

const modelValue = defineModel({ type: String, default: 'info' })

const props = defineProps({
  showLabel: { type: Boolean, default: false },
})

const { t } = useI18n()

const currentOption = computed(() => variantOptions[modelValue.value] ?? variantOptions[VARIANT.INFO])

const withLabel = computed(() => props.showLabel ? 'outline-tertiary' : 'link')
</script>

<template>
  <b-dropdown
    :variant="withLabel"
    class="variant-dropdown"
    :class="{ 'variant-dropdown--without-label': !showLabel }"
    teleport-to="body"
    menu-class="variant-dropdown__menu"
  >
    <template #button-content>
      <span class="d-inline-flex gap-2">
        <app-icon
          :name="currentOption.icon"
          class="me-1"
          :class="'text-'+modelValue"
        />
        <span
          v-if="showLabel"
          class="variant-dropdown__label me-2"
        >{{ t(currentOption.key) }}</span>
      </span>
    </template>
    <b-dropdown-item
      v-for="(opt, key) in variantOptions"
      :key="key"
      @click="modelValue = key"
    >
      <app-icon
        :name="opt.icon"
        class="me-1"
        :class="'text-'+key"
      />
      {{ t(opt.key) }}
    </b-dropdown-item>
  </b-dropdown>
</template>

<style lang="scss">
.variant-dropdown {
  &__menu {
    z-index: $zindex-modal + 1;
  }

  &--without-label .btn {
    padding: 0;
    line-height: 2em;
  }
}
</style>

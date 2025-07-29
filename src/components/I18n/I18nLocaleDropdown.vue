<script setup>
import { useTemplateRef } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

import { useLocale } from '@/composables/useLocale'
import { PLACEMENT, placementValidator } from '@/enums/placements'

defineProps({
  popoverPlacement: {
    type: String,
    default: PLACEMENT.RIGHT,
    validator: placementValidator
  }
})

const popover = useTemplateRef('popover')
const { currentLocale, setLocale, locales } = useLocale()

const chooseLocale = async (localeKey) => {
  if (popover.value?.hide) {
    popover.value.hide()
  }
  await setLocale(localeKey)
}

const dropdownItemClass = (key) => {
  return {
    active: key === currentLocale.value.key,
    [`dropdown-item--${key.toLowerCase()}`]: true
  }
}
</script>

<template>
  <b-popover
    ref="popover"
    click
    :placement="popoverPlacement"
    teleport-to="body"
    class="i18n-locale-dropdown__list popover-body-p-0"
  >
    <template #target>
      <b-button
        class="i18n-locale-dropdown"
        href="#"
        :variant="null"
        @click.prevent
      >
        <span class="i18n-locale-dropdown__button">
          <slot v-bind="{ currentLocale, locales }">
            <phosphor-icon
              :name="PhGlobeHemisphereWest"
              class="me-1"
            />
            {{ currentLocale.label }}
          </slot>
        </span>
      </b-button>
    </template>
    <div class="dropdown-menu show position-static border-0 px-2 bg-transparent">
      <a
        v-for="{ key, label } in locales"
        :key="key"
        href="#"
        class="dropdown-item"
        :class="dropdownItemClass(key)"
        @click.prevent="chooseLocale(key)"
      >
        {{ label }}
      </a>
    </div>
  </b-popover>
</template>

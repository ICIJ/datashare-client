<script setup>
import { ref } from 'vue'
import { uniqueId } from 'lodash'
import { PhosphorIcon } from '@icij/murmur-next'

import { useLocale } from '@/composables/locale'
import { PLACEMENT, placementValidator } from '@/enums/placements'

defineProps({
  popoverPlacement: {
    type: String,
    default: PLACEMENT.RIGHT,
    validator: placementValidator
  }
})

const id = uniqueId('i18n-locale-dropdown')
const popover = ref(null)
const { currentLocale, setLocale, locales } = useLocale()
const chooseLocale = async (localeKey) => {
  if (popover.value?.hide) {
    popover.value.hide(new Event('forceHide'))
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
  <b-button :id="id" class="i18n-locale-dropdown" href="#" :variant="null" @click.prevent>
    <span class="i18n-locale-dropdown__button">
      <slot v-bind="{ currentLocale, locales }">
        <phosphor-icon name="globe-hemisphere-west" class="me-1" />
        {{ currentLocale.label }}
      </slot>
    </span>
    <teleport to="body">
      <b-popover
        ref="popover"
        click
        :placement="popoverPlacement"
        :target="id"
        custom-class="i18n-locale-dropdown__list popover-body-p-0"
      >
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
    </teleport>
  </b-button>
</template>

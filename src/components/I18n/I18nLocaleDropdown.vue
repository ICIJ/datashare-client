<script setup>
import { ref, computed, watch } from 'vue'
import { uniqueId, find } from 'lodash'
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import { useCore } from '@/composables/core'
import settings from '@/utils/settings'

defineProps({
  popoverPlacement: {
    type: String,
    default: 'right'
  }
})

const { locale } = useI18n()
const { core } = useCore()

const id = uniqueId('i18n-locale-dropdown')
const popover = ref(null)
const currentLocale = computed(() => find(settings.locales, { key: locale.value }))
// Watch for changes in the current locale and load the locale
watch(currentLocale, ({ key }) => core?.loadI18Locale(key))

const chooseLocale = async (localeKey) => {
  if (popover.value?.hide) {
    popover.value.hide(new Event('forceHide'))
  }
  await core?.loadI18Locale(localeKey)
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
      <slot v-bind="{ currentLocale, locales: settings.locales }">
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
            v-for="{ key, label } in settings.locales"
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

<template>
  <b-button :id="uniqueId" class="locales-menu" href="#" variant="none">
    <span class="locales-menu__button">
      <slot v-bind="{ currentLocale, locales }">
        <fa icon="globe" class="mr-1"></fa>
        {{ currentLocale.label }}
      </slot>
    </span>
    <b-popover
      ref="popover"
      :target="uniqueId"
      triggers="click blur"
      custom-class="locales-menu__list popover-body-p-0"
    >
      <div class="dropdown-menu show position-static border-0 px-2 bg-transparent">
        <a
          v-for="locale in locales"
          :key="locale.key"
          href="#"
          class="dropdown-item"
          :class="{ active: locale.key === currentLocale.key }"
          @click.prevent="chooseLocale(locale.key)"
        >
          {{ locale.label }}
        </a>
      </div>
    </b-popover>
  </b-button>
</template>

<script>
import { uniqueId, find } from 'lodash'

import settings from '@/utils/settings'

/**
 * A button toggling a menu to select active locale.
 */
export default {
  name: 'LocalesMenu',
  props: {
    /**
     * Button size
     * @values sm, md, lg
     */
    size: {
      type: String
    },
    /**
     * Hide the caret
     */
    noCaret: {
      type: Boolean
    }
  },
  data() {
    return {
      locales: settings.locales
    }
  },
  computed: {
    currentLocale() {
      const key = this.$i18n.locale
      return find(this.locales, { key })
    },
    uniqueId() {
      return uniqueId('locales-menu')
    }
  },
  watch: {
    currentLocale({ key }) {
      return this.$core.loadI18Locale(key)
    }
  },
  methods: {
    async chooseLocale(locale) {
      await this.$core.loadI18Locale(locale)
      if (this.$refs.popover) {
        this.$refs.popover.$emit('close')
      }
    }
  }
}
</script>

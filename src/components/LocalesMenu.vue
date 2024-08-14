<template>
  <b-button :id="uniqueId" class="locales-menu" href="#" :variant="null" @click.prevent>
    <span class="locales-menu__button">
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
        :target="uniqueId"
        custom-class="locales-menu__list popover-body-p-0"
      >
        <div class="dropdown-menu show position-static border-0 px-2 bg-transparent">
          <a
            v-for="locale in locales"
            :key="locale.key"
            href="#"
            class="dropdown-item"
            :class="dropdownItemClass(locale)"
            @click.prevent="chooseLocale(locale.key)"
          >
            {{ locale.label }}
          </a>
        </div>
      </b-popover>
    </teleport>
  </b-button>
</template>

<script>
import { uniqueId, find } from 'lodash'
import { PhosphorIcon } from '@icij/murmur-next'

import settings from '@/utils/settings'

/**
 * A button toggling a menu to select active locale.
 */
export default {
  name: 'LocalesMenu',
  components: {
    PhosphorIcon
  },
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
    },
    popoverPlacement: {
      type: String,
      default: 'right'
    }
  },
  emits: ['close'],
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
      return this.$core?.loadI18Locale(key)
    }
  },
  methods: {
    async chooseLocale(locale) {
      if (this.$refs.popover?.hide) {
        this.$refs.popover.hide(new Event('forceHide'))
      }
      await this?.$core?.loadI18Locale(locale)
    },
    dropdownItemClass({ key }) {
      return {
        active: key === this.currentLocale.key,
        [`dropdown-item--${key.toLowerCase()}`]: true
      }
    }
  }
}
</script>

<style class="scss" scoped>
.locales-menu {
  color: inherit;
}
</style>

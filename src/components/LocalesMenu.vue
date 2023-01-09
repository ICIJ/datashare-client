<template>
  <b-button class="locales-menu" :id="uniqueId" href="#" variant="none">
    <span class="locales-menu__button">
      <slot v-bind="{ currentLocale, locales }">
        <fa icon="globe" class="mr-1"></fa>
        {{ currentLocale.label }}
      </slot>
    </span>
    <b-popover
      :target="uniqueId"
      triggers="click blur"
      custom-class="locales-menu__list popover-body-p-0"
      ref="popover"
    >
      <div class="dropdown-menu show position-static border-0 px-2 bg-transparent">
        <a
          href="#"
          class="dropdown-item"
          v-for="locale in locales"
          :key="locale.key"
          @click.prevent="chooseLocale(locale.key)"
          :class="{ active: locale === currentLocale }"
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
      locales: settings.locales,
      loadedLocales: [settings.defaultLocale]
    }
  },
  computed: {
    currentLocale() {
      const key = localStorage.getItem('locale') ? localStorage.getItem('locale') : this.$i18n.locale
      this.loadLocale(key)
      return find(this.locales, { key })
    },
    uniqueId() {
      return uniqueId('locales-menu')
    }
  },
  methods: {
    async chooseLocale(locale) {
      await this.loadLocale(locale)
      if (this.$refs.popover) {
        this.$refs.popover.$emit('close')
      }
    },
    setI18nLanguage(locale) {
      localStorage.setItem('locale', locale)
      this.$i18n.locale = locale
      return locale
    },
    loadLocale(locale) {
      if (this.$i18n.locale !== locale) {
        if (!this.loadedLocales.includes(locale)) {
          return import(/* webpackChunkName: "[request]" */ '@/lang/' + locale + '.json').then((messages) => {
            this.$i18n.setLocaleMessage(locale, messages.default)
            this.loadedLocales.push(locale)
            return this.setI18nLanguage(locale)
          })
        }
        return Promise.resolve(this.setI18nLanguage(locale))
      }
      return Promise.resolve(locale)
    }
  }
}
</script>

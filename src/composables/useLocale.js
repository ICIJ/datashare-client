import { computed, watch } from 'vue'
import { find } from 'lodash'
import { useI18n } from 'vue-i18n'

import settings from '@/utils/settings'
import { useCore } from '@/composables/core'

export function useLocale() {
  const { locale } = useI18n()
  const { core } = useCore()
  const locales = settings.locales
  const currentLocale = computed(() => find(locales, { key: locale.value }))
  // Watch for changes in the current locale and load the locale
  watch(currentLocale, ({ key }) => core?.loadI18Locale(key))
  const setLocale = async (localeKey) => {
    await core?.loadI18Locale(localeKey)
  }
  return { currentLocale, setLocale, locales }
}

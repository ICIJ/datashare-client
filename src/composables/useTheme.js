import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'

import IPhPaintRoller from '~icons/ph/paint-roller'
import IPhSun from '~icons/ph/sun'
import IPhMoon from '~icons/ph/moon'

import themeAuto from '@/assets/images/theme-auto.png'
import themeLight from '@/assets/images/theme-light.png'
import themeDark from '@/assets/images/theme-dark.png'

let eventAdded = false

const LOCAL_STORAGE_KEY = 'data-bs-theme'

const THEMES = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
  AUTOMATIC: 'automatic'
})

export function getAutomaticTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT
}

export function getTheme() {
  return localStorage.getItem(LOCAL_STORAGE_KEY) ?? THEMES.AUTOMATIC
}

export function setTheme(theme) {
  document.body?.setAttribute('data-bs-theme', theme === THEMES.AUTOMATIC ? getAutomaticTheme() : theme)
  localStorage.setItem(LOCAL_STORAGE_KEY, theme)
}

export function useTheme() {
  const { t } = useI18n()

  if (!eventAdded) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (getTheme() === THEMES.AUTOMATIC) {
        setTheme(THEMES.AUTOMATIC)
      }
    })

    eventAdded = true
  }

  const themes = reactive([
    {
      icon: IPhPaintRoller,
      name: THEMES.AUTOMATIC,
      label: t('themes.automatic'),
      thumbnail: themeAuto
    },
    {
      icon: IPhSun,
      name: THEMES.LIGHT,
      label: t('themes.light'),
      thumbnail: themeLight
    },
    {
      icon: IPhMoon,
      name: THEMES.DARK,
      label: t('themes.dark'),
      thumbnail: themeDark
    }
  ])

  return { getTheme, setTheme, themes }
}

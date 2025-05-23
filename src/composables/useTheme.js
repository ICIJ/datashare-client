import { reactive } from 'vue'

import themeAuto from '@/assets/images/theme-auto.png'
import themeLight from '@/assets/images/theme-light.png'
import themeDark from '@/assets/images/theme-dark.png'

let eventAdded = false
export function useTheme() {
  const LOCAL_STORAGE_KEY = 'data-bs-theme'

  const THEMES = Object.freeze({
    LIGHT: 'light',
    DARK: 'dark',
    AUTOMATIC: 'automatic'
  })

  function getTheme() {
    return localStorage.getItem(LOCAL_STORAGE_KEY) ?? THEMES.AUTOMATIC
  }

  function getAutomaticTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT
  }

  function setTheme(theme) {
    document.body?.setAttribute('data-bs-theme', theme === THEMES.AUTOMATIC ? getAutomaticTheme() : theme)
    localStorage.setItem(LOCAL_STORAGE_KEY, theme)
  }

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
      icon: 'paint-roller',
      name: THEMES.AUTOMATIC,
      label: `Automatic`,
      thumbnail: themeAuto
    },
    {
      icon: 'sun',
      name: THEMES.LIGHT,
      label: 'Light mode',
      thumbnail: themeLight
    },
    {
      icon: 'moon',
      name: THEMES.DARK,
      label: 'Dark mode',
      thumbnail: themeDark
    }
  ])

  return { getTheme, setTheme, themes }
}

import { reactive } from 'vue'

import themeAuto from '@/assets/images/theme-auto.png'
import themeLight from '@/assets/images/theme-light.png'
import themeDark from '@/assets/images/theme-dark.png'

let eventAdded = false

export function useTheme() {
  const LOCAL_STORAGE_KEY = 'data-bs-theme'
  const AUTOMATIC = 'automatic'
  function getTheme() {
    return localStorage.getItem(LOCAL_STORAGE_KEY) ?? AUTOMATIC
  }
  function getAutomaticTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  if (!eventAdded) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (getTheme() === AUTOMATIC) {
        setTheme(AUTOMATIC)
      }
    })
    eventAdded = true
  }
  function setTheme(theme) {
    document.body?.setAttribute('data-bs-theme', theme === AUTOMATIC ? getAutomaticTheme() : theme)
    localStorage.setItem(LOCAL_STORAGE_KEY, theme)
  }
  const themes = reactive([
    {
      icon: 'paint-roller',
      name: 'automatic',
      label: `Automatic`,
      thumbnail: themeAuto
    },
    {
      icon: 'sun',
      name: 'light',
      label: 'Light mode',
      thumbnail: themeLight
    },
    {
      icon: 'moon',
      name: 'dark',
      label: 'Dark mode',
      thumbnail: themeDark
    }
  ])
  return { getTheme, setTheme, themes }
}

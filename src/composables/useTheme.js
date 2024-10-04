import themeLight from '@/assets/images/illustrations/theme-light.png'
import themeDark from '@/assets/images/illustrations/theme-dark.png'

export function useTheme() {
  const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  const LOCAL_STORAGE_KEY = 'data-bs-theme'
  const theme = localStorage.getItem(LOCAL_STORAGE_KEY) || preferredTheme
  function setTheme(theme) {
    document.body?.setAttribute('data-bs-theme', theme)
    localStorage.setItem(LOCAL_STORAGE_KEY, theme)
  }
  const themes = [
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
  ]
  return { theme, setTheme, preferredTheme, themes }
}

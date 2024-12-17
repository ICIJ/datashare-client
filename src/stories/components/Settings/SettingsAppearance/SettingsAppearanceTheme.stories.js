import SettingsAppearanceTheme from '@/components/Settings/SettingsAppearance/SettingsAppearanceTheme'

export default {
  decorators: [],
  title: 'Components/Settings/SettingsAppearance/SettingsAppearanceTheme',
  tags: ['autodocs'],
  component: SettingsAppearanceTheme,
  args: {
    icon: 'sun',
    label: 'light',
    text: 'Light mode',
    thumbnail: 'https://placehold.co/60x40'
  }
}
export const Default = {}
export const Active = {
  args: {
    active: true
  }
}

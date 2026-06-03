import SettingsAppearanceOption from '@/components/Settings/SettingsAppearance/SettingsAppearanceOption'

export default {
  decorators: [],
  title: 'Components/Settings/SettingsAppearance/SettingsAppearanceOption',
  tags: ['autodocs'],
  component: SettingsAppearanceOption,
  args: {
    icon: markRaw(IPhSun),
    label: 'light',
    text: 'Light mode',
    thumbnail: 'https://placehold.co/60x40'
  }
}

export const Default = {}

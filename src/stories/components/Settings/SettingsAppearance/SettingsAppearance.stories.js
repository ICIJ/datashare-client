import SettingsAppearance from '@/views/Settings/SettingsViewAppearance'

export default {
  decorators: [],
  title: 'Components/Settings/SettingsAppearance/SettingsAppearance',
  tags: ['autodocs'],
  component: SettingsAppearance,
  args: {
    options: [
      {
        icon: 'sun',
        name: 'light',
        label: 'Light mode',
        thumbnail: 'https://placehold.co/169x95'
      },
      {
        icon: 'moon',
        name: 'dark',
        label: 'Dark mode',
        thumbnail: 'https://placehold.co/169x95'
      }
    ]
  }
}
export const Default = {}

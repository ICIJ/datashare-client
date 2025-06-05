import SettingsAppearance from '@/components/Settings/SettingsAppearance/SettingsAppearance'

export default {
  decorators: [],
  title: 'Components/Settings/SettingsAppearance/SettingsAppearance',
  tags: ['autodocs'],
  component: SettingsAppearance,
  args: {
    modelValue: 'light',
    options: [
      {
        icon: 'paint',
        name: 'automatic',
        label: 'Automatic'
      },
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

import SettingsAppearanceRadioGroup from '@/components/Settings/SettingsAppearance/SettingsAppearanceRadioGroup'

export default {
  decorators: [],
  title: 'Components/Settings/SettingsAppearance/SettingsAppearanceRadioGroup',
  tags: ['autodocs'],
  component: SettingsAppearanceRadioGroup,
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

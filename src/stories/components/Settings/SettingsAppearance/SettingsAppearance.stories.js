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
        icon: markRaw(IPhPaintBrush),
        name: 'automatic',
        label: 'Automatic'
      },
      {
        icon: markRaw(IPhSun),
        name: 'light',
        label: 'Light mode',
        thumbnail: 'https://placehold.co/169x95'
      },
      {
        icon: markRaw(IPhMoon),
        name: 'dark',
        label: 'Dark mode',
        thumbnail: 'https://placehold.co/169x95'
      }
    ]
  }
}

export const Default = {}

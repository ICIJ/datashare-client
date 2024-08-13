import ButtonSaveSearch from '@/components/Button/ButtonSaveSearch'

export default {
  tags: ['autodocs'],
  title: 'Components/Button/ButtonSaveSearch',
  component: ButtonSaveSearch,
  args: {
    saved: false,
    loading: false,
    compactBreakpoint: 'sm'
  },
  decorators: [
    () => ({
      template: `
        <story/>
        <p class="small my-3 text-secondary-emphasis">
          Resize the window down to see the compact version.
        </p>
      `
    })
  ]
}

export const Default = {}

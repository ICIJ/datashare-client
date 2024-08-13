import ButtonToggleAdvancedSearch from '@/components/Button/ButtonToggleAdvancedSearch'

export default {
  tags: ['autodocs'],
  title: 'Components/Button/ButtonToggleAdvancedSearch',
  component: ButtonToggleAdvancedSearch,
  args: {
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

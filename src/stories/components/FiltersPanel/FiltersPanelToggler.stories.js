import FiltersPanelToggler from '@/components/FiltersPanel/FiltersPanelToggler'

export default {
  title: 'Components/FiltersPanel/FiltersPanelToggler',
  tags: ['autodocs'],
  component: {
    FiltersPanelToggler
  },
  argTypes: {},
  args: {},
  render: (args) => ({
    components: {
      FiltersPanelToggler
    },
    setup: () => ({ args }),
    template: `
      <div class="p-5" style="background-color: var(--bs-tertiary-bg-subtle);">
        <filters-panel-toggler />
      </div>
    `
  })
}

export const Default = {}

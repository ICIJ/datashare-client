import FiltersPanelToggler from '@/components/FiltersPanelToggler.vue'

export default {
  title: 'Components/FiltersPanel/Toggler',
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
      <div class="p-5" style="background-color: var(--bs-light-bg-subtle);">
        <filters-panel-toggler />
      </div>
    `
  })
}

export const Default = {}

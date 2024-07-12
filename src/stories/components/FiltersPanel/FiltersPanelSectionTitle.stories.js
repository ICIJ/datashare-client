import FiltersPanelSectionTitle from '@/components/FiltersPanel/FiltersPanelSectionTitle.vue'

export default {
  title: 'Components/FiltersPanel/FiltersPanelSectionTitle',
  tags: ['autodocs'],
  component: {
    FiltersPanelSectionTitle
  },
  argTypes: {},
  args: {
    title: 'Named entities'
  },
  render: (args) => ({
    components: {
      FiltersPanelSectionTitle
    },
    setup: () => ({ args }),
    template: `
      <div class="p-5" style="background-color: var(--bs-light-bg-subtle);">
        <filters-panel-section-title :title="args.title" />
      </div>
    `
  })
}

export const Default = {}
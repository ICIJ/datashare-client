import ParentOverflow from '@/components/ParentOverflow/ParentOverflow'

export default {
  title: 'Components/ParentOverflow/ParentOverflow',
  tags: ['autodocs'],
  component: ParentOverflow,
  render: args => ({
    components: {
      ParentOverflow
    },
    setup: () => {
      return { args }
    },
    template: `
        <parent-overflow class="d-flex bg-info">
          <div class="bg-info-subtle p-3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </div>
          <template #fallback>
            <div class="bg-danger-subtle p-3 text-truncate">
              Overflowed!
            </div>
          </template>
        </parent-overflow>
        <p class="fst-italic py-3">Try to resize the window.</p>
    `
  })
}

export const Default = {}

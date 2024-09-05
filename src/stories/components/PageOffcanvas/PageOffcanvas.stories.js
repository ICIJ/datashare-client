import { BFormCheckbox } from 'bootstrap-vue-next'

import { offcanvasPlacementArgType } from '~storybook/utils'
import { OFFCANVAS_PLACEMENT } from '@/enums/placements'
import PageOffcanvas from '@/components/PageOffcanvas/PageOffcanvas'

export default {
  tags: ['autodocs'],
  title: 'Components/PageOffcanvas/PageOffcanvas',
  component: PageOffcanvas,
  argTypes: {
    modelValue: Boolean,
    placement: offcanvasPlacementArgType
  },
  args: {
    modelValue: true,
    placement: OFFCANVAS_PLACEMENT.END,
    title: 'Results settings'
  },
  decorators: [
    (_, { args }) => ({
      components: { BFormCheckbox },
      setup: () => ({ args }),
      template: `
        <b-form-checkbox v-model="args.modelValue">
          Toggle <code class="bg-primary-subtle p-1 rounded">PageOffcanvas</code>
        </b-form-checkbox>
        <story />
      `
    })
  ]
}

export const Default = {}

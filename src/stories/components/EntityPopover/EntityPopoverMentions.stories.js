import { computed, ref } from 'vue'

import EntityPopoverMentions from '@/components/EntityPopover/EntityPopoverMentions'
const excerpt = 'Lorem ipsum Bruno Mars dolor ipset'
const excerpts = [excerpt, 'Lorem ipsum  dolor ipset Bruno Mars', 'Bruno Mars Lorem ipsum  dolor ipset']
export default {
  title: 'Components/EntityPopover/EntityPopoverMentions',
  component: EntityPopoverMentions,
  tags: ['autodocs'],
  args: {
    mention: 'Bruno Mars',
    projects: ['banana papers', 'citrus confidential'],
    nbMentions: excerpts.length,
    excerpt,
    excerpts
  },
  render: (args) => ({
    components: {
      EntityPopoverMentions
    },
    setup: () => {
      const index = ref(1)
      const current = computed(() => excerpts[index.value - 1])
      return { args, index, current }
    },

    template: `

        <entity-popover-mentions v-bind="args" :excerpt="current" v-model="index"   />
    `
  })
}
export const Default = {}

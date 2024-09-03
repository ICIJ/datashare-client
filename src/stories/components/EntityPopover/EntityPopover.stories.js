import EntityPopover from '@/components/EntityPopover/EntityPopover'

export default {
  title: 'Components/EntityPopover/EntityPopover',
  component: EntityPopover,
  tags: ['autodocs'],
  args: {
    language: 'English',
    model: 'CoreNLP',
    mention: 'Bruno Mars',
    excerpt: 'Lorem ipsum Bruno Mars dolor ipset',
    nbMentions: 5033,
    projects: ['banana papers', 'citrus confidential']
  },
  render: (args) => ({
    components: {
      EntityPopover
    },
    setup: () => ({ args }),
    computed: {
      trigger() {
        return `btn-${this.$.uid}`
      },
      title() {
        return args.document.title
      }
    },
    template: `
      <div class="p-sm-5 p-3 text-center">
        <button type="button" class="btn btn-outline-primary" :id="trigger">
          Mentions of <var class="text-decoration-underline">{{ args.mention }}</var>
        </button>
        <entity-popover v-bind="args" :target="trigger" />
      </div>
    `
  })
}
export const Default = {}

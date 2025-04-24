import AppPopover from '@/components/AppPopover/AppPopover'

export default {
  title: 'Components/AppPopover/AppPopover',
  tags: ['autodocs'],
  component: AppPopover,
  args: {
    show: true,
    manual: true,
    title: 'Fill the form',
    default: 'A batch search is a search of several queries in one batch only.'
  },
  parameters: {
    slots: {
      default: `Default slot content`
    }
  },
  render(args) {
    return {
      components: {
        AppPopover
      },
      template: `
        <app-popover v-bind="args">
          {{ args.default }}
           <template #target="{ hide }">
            <button class="btn btn-action" @click="hide">
              Toggle popover
            </button>
          </template>
        </app-popover>
      `,
      data() {
        return { args }
      }
    }
  }
}

export const Default = {}

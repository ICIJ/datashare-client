import { BAlert } from 'bootstrap-vue-next'

export default {
  title: 'Layout/Alerts',
  component: BAlert,
  args: {
    variants: ['info', 'danger', 'success', 'warning', 'action', 'primary', 'secondary', 'tertiary'],
    content: 'A text of average length and without HTML or anything fancy.'
  },
  render: (args) => ({
    components: { BAlert },
    setup() {
      return { args }
    },
    template: `
      <div>
        <b-alert v-for="variant in args.variants" model-value :variant="variant" class="position-relative">
          {{ args.content }}
          <span class="badge rounded-0 position-absolute top-0 end-0" :class="'text-bg-' + variant">
            {{ variant }}
          </span>
        </b-alert>
      </div>
    `
  })
}

export const Default = {}

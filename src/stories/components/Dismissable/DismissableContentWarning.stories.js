import DismissableContentWarning from '@/components/Dismissable/DismissableContentWarning'

export default {
  title: 'Components/Dismissable/DismissableContentWarning',
  component: DismissableContentWarning,
  tags: ['autodocs'],
  args: {
    show: true
  },
  render: args => ({
    components: { DismissableContentWarning },
    setup() {
      return { args }
    },
    template: `
      <dismissable-content-warning v-bind="args" @update:modelValue="args.show = $event">
        <img src="https://placehold.co/600x400/FBEBEC/DC3545?text=NSFW&font=playfair-display" alt="NSFW" />
      </dismissable-content-warning>
    `
  })
}

export const Default = {}

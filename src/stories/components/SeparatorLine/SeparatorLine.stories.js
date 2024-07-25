import SepratorLine from '@/components/SeparatorLine/SeparatorLine'

export default {
  components: { SepratorLine },
  title: 'Components/SepratorLine',
  component: SepratorLine,
  tags: ['autodocs'],
  args: {
    active: true,
    min: 180,
    reduceDisabled: false,
    expandDisabled: false
  },
  render: (args) => ({
    components: {
      SepratorLine
    },
    setup() {
      return {
        args
      }
    },
    data() {
      return {
        left: 250
      }
    },
    computed: {
      separatorLineStyle() {
        return {
          position: 'absolute',
          top: 0,
          left: `${this.left}px`
        }
      },
      placeholderStyle() {
        return {
          width: `calc(${this.left}px + 1em)`
        }
      }
    },
    template: `
      <div style="position: relative; height: 400px; max-height: 80vh; background-color: var(--bs-tertiary-bg-subtle); overflow: hidden; display: flex;">
        <seprator-line
          :style="separatorLineStyle"
          @drag="left = $event"
          @reduce="left = $event"
          @expand="left = $event"
          v-bind="args" />

        <div class="bg-action-subtle d-flex align-items-center justify-content-center" :style="placeholderStyle">
          <code v-if="args.min < left">min-width: {{ args.min }}px</code>
        </div>
        <div class="bg-primary-subtle flex-grow-1"></div>
      </div>
    `
  })
}

export const Default = {}

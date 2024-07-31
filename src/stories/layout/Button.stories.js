import { BButton } from 'bootstrap-vue-next'

import ButtonIcon from '@/components/Button/ButtonIcon'

export default {
  title: 'Layout/Button',
  component: BButton,
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg']
    }
  },
  render: (args) => ({
    components: {
      BButton,
      ButtonIcon
    },
    setup() {
      return {
        args
      }
    },
    computed: {
      variants() {
        return [
          'link',
          'action',
          'primary',
          'secondary',
          'tertiary',
          'dark',
          'light',
          'info',
          'danger',
          'success',
          'warning',
          'outline-action',
          'outline-primary',
          'outline-secondary',
          'outline-tertiary',
          'outline-dark',
          'outline-light',
          'outline-info',
          'outline-danger',
          'outline-success',
          'outline-warning'
        ]
      }
    },
    template: `
      <table class="table">
        <thead>
          <tr>
            <th>Variant</th>
            <th>Normal</th>
            <th>Hover</th>
            <th>Loading</th>
            <th>Focus</th>
            <th>Disabled</th>
            <th>Active/Pressed</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="variant in variants">
            <tr :key="variant">
              <td>
                <code>.btn-{{ variant }}</code>
              </td>
              <td><b-button v-bind="args" :variant="variant">{{args.label}}</b-button></td>
              <td><b-button v-bind="args" :variant="variant" class="hover">{{args.label}}</b-button></td>
              <td><button-icon v-bind="args" :variant="variant" loading>{{args.label}}</button-icon></td>
              <td><b-button v-bind="args" :variant="variant" class="focus">{{args.label}}</b-button></td>
              <td><b-button v-bind="args" :variant="variant" disabled>{{args.label}}</b-button></td>
              <td><b-button v-bind="args" :variant="variant" pressed>{{args.label}}</b-button></td>
            </tr>
          </template>
        </tbody>
      </table>
    `
  }),
  parameters: {
    pseudo: {
      hover: ['.hover'],
      focus: ['.focus']
    }
  }
}

export const Default = {
  args: {
    size: 'md',
    label: 'Button'
  }
}

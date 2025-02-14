import { BButton } from 'bootstrap-vue-next'

import ButtonIcon from '@/components/Button/ButtonIcon'
import { VARIANTS } from '@/enums/variants'
import { buttonSizesArgType } from '~storybook/utils'
import { SIZE } from '@/enums/sizes'

export default {
  title: 'Layout/Buttons',
  component: BButton,
  argTypes: {
    size: buttonSizesArgType
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
        return VARIANTS
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
          <template v-for="variant in variants" :key="variant">
            <tr>
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
    size: SIZE.MD,
    label: 'Button'
  }
}

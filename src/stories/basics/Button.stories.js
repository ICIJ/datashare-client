import { BButton, BCloseButton } from 'bootstrap-vue-next'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories

export default {
  title: 'Basics/Button',
  component: BButton,
  argTypes: {
    size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
    variant: { control: { type: 'select' }, options: ['primary', 'secondary', 'tertiary', 'light'] }
  },
  render: (args) => ({
    // Components used in your story `template` are defined in the `components` object
    components: {
      BButton,
      BCloseButton
    },
    // The story's `args` need to be mapped into the template through the `setup()` method
    setup() {
      // Story args can be spread into the returned object
      return {
        args
      }
    },
    template: `
    <table class="table">
    <thead>
      <tr>
        <th>State</th>
        <th>Base</th>
        <th>Primary</th>
        <th>Secondary</th>
        <th>Tertiary</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Default </td>
        <td><b-button v-bind="args" >{{args.label}}</b-button></td>
        <td><b-button v-bind="args" variant="primary" >{{args.label}}</b-button></td>
        <td><b-button v-bind="args" variant="secondary" >{{args.label}}</b-button></td>
        <td><b-button v-bind="args" variant="tertiary" >{{args.label}}</b-button></td>
      </tr>
      <tr>
        <td>Hover </td>
        <td><b-button v-bind="args" id="hover" >{{args.label}}</b-button></td>
        <td><b-button v-bind="args" variant="primary" id="hover">{{args.label}}</b-button></td>
        <td><b-button v-bind="args" variant="secondary" id="hover">{{args.label}}</b-button></td>
        <td><b-button v-bind="args" variant="tertiary" id="hover">{{args.label}}</b-button></td>
      </tr>
      <tr>
        <td>Focus </td>
        <td><b-button v-bind="args" id="focus">{{args.label}}</b-button></td>
        <td><b-button v-bind="args" variant="primary" id="focus">{{args.label}}</b-button></td>
        <td><b-button v-bind="args" variant="secondary" id="focus">{{args.label}}</b-button></td>
        <td><b-button v-bind="args" variant="tertiary" id="focus">{{args.label}}</b-button></td>
      </tr>
      <tr>
        <td>Active </td>
        <td><b-button v-bind="args" id="active">{{args.label}}</b-button></td>
        <td><b-button v-bind="args" variant="primary" id="active">{{args.label}}</b-button></td>
        <td><b-button v-bind="args" variant="secondary" id="active">{{args.label}}</b-button></td>
        <td><b-button v-bind="args" variant="tertiary" id="active">{{args.label}}</b-button></td>
      </tr>
      <tr>
        <td>Pressed </td>
        <td><b-button v-bind="args" pressed>{{args.label}}</b-button></td>
        <td><b-button v-bind="args" variant="primary" pressed>{{args.label}}</b-button></td>
        <td><b-button v-bind="args" variant="secondary" pressed>{{args.label}}</b-button></td>
        <td><b-button v-bind="args" variant="tertiary" pressed>{{args.label}}</b-button></td>
      </tr>
      <tr>
        <td>Disabled </td>
        <td><b-button v-bind="args" disabled>{{args.label}}</b-button></td>
        <td><b-button v-bind="args" variant="primary" disabled>{{args.label}}</b-button></td>
        <td><b-button v-bind="args" variant="secondary" disabled>{{args.label}}</b-button></td>
        <td><b-button v-bind="args" variant="tertiary" disabled>{{args.label}}</b-button></td>
      </tr>
      <tr>
        <td>Loading </td>
        <td><b-button v-bind="args" loading>{{args.label}}</b-button></td>
        <td><b-button v-bind="args" variant="primary" loading>{{args.label}}</b-button></td>
        <td><b-button v-bind="args" variant="secondary" loading>{{args.label}}</b-button></td>
        <td><b-button v-bind="args" variant="tertiary" loading>{{args.label}}</b-button></td>
      </tr>
      <tr>
        <td>BCloseButton </td>
        <td><BCloseButton v-bind="args">{{args.label}}</BCloseButton></td>
        <td><BCloseButton v-bind="args" variant="primary">{{args.label}}</BCloseButton></td>
        <td><BCloseButton v-bind="args" variant="secondary">{{args.label}}</BCloseButton></td>
        <td><BCloseButton v-bind="args" variant="tertiary">{{args.label}}</BCloseButton></td>
      </tr>
    </tbody>
    </table>
    `
  }),
  parameters: {
    pseudo: {
      hover: ['#hover'],
      focus: ['#focus'],
      active: ['#active']
    }
  }
}

// // More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default = {
  args: {
    variant: '',
    size: 'md',
    label: 'Button'
  }
}

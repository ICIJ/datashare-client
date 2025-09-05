import { BFormRadioGroup, BFormGroup } from 'bootstrap-vue-next'
import { ref } from 'vue'

export default {
  title: 'Layout/FormRadio',
  render: args => ({
    // Components used in your story `template` are defined in the `components` object
    components: { BFormGroup, BFormRadioGroup },
    // The story's `args` need to be mapped into the template through the `setup()` method
    setup() {
      // Story args can be spread into the returned object

      const selected = ref('first')

      return {
        args,
        selected
      }
    },
    template: `
      <div>
      <b-form-group label="Radio buttons" v-slot="{ariaDescribedby}">
        <b-form-radio-group
          v-model="selected"
          :options="args.options"
          :stacked="args.stacked"
          :aria-describedby="ariaDescribedby"
          name="flavour-1"
        >
        </b-form-radio-group>
      </b-form-group>
        Selected value : {{selected}}
      </div>
    `
  })
}
export const Stacked = {
  args: {
    options: [
      { text: 'Toggle this custom radio', value: 'first' },
      { text: 'Or toggle this other custom radio', value: 'second' },
      { text: 'This one is Disabled', value: 'third', disabled: true },
      { text: 'This is the 4th radio', value: { fourth: 4 } }
    ],
    stacked: true
  }
}
export const Inline = {
  args: {
    options: [
      { text: 'Toggle this custom radio', value: 'first' },
      { text: 'Or toggle this other custom radio', value: 'second' },
      { text: 'This one is Disabled', value: 'third', disabled: true },
      { text: 'This is the 4th radio', value: { fourth: 4 } }
    ],
    stacked: false
  }
}

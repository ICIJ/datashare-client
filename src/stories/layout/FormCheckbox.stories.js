import { BFormCheckboxGroup, BFormGroup } from 'bootstrap-vue-next'
import { ref } from 'vue'

export default {
  title: 'Layout/FormCheckbox',
  render: args => ({
    // Components used in your story `template` are defined in the `components` object
    components: { BFormGroup, BFormCheckboxGroup },
    // The story's `args` need to be mapped into the template through the `setup()` method
    setup() {
      // Story args can be spread into the returned object
      const selected = ref([])

      return {
        args,
        selected
      }
    },
    template: `
      <div>
      <b-form-group label="Checkboxes" v-slot="{ariaDescribedby}">
        <b-form-checkbox-group
          v-model="selected"
          :options="args.options"
          :stacked="args.stacked"
          :aria-describedby="ariaDescribedby"
          name="flavour-1"
        >
        </b-form-checkbox-group>
      </b-form-group>
        Selected values: {{selected}}
      </div>
    `
  })
}

export const Stacked = {
  args: {
    options: [
      { text: 'Orange', value: 'orange' },
      { text: 'Apple', value: 'apple', disabled: true },
      { text: 'Pineapple', value: 'pineapple' },
      { text: 'Grape', value: 'grape' }
    ],
    stacked: true
  }
}
export const Inline = {
  args: {
    options: [
      { text: 'Orange', value: 'orange' },
      { text: 'Apple', value: 'apple', disabled: true },
      { text: 'Pineapple', value: 'pineapple' },
      { text: 'Grape', value: 'grape' }
    ],
    stacked: false
  }
}

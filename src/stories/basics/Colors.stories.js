import { BButton, BCloseButton } from 'bootstrap-vue-next'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories

export default {
  title: 'Basics/Colors',
  render: (args) => ({
    // The story's `args` need to be mapped into the template through the `setup()` method
    setup() {
      // Story args can be spread into the returned object
      return {
        args
      }
    },
    template: `
      <div style="background: var(--bs-primary); width: 50px; height: 50px">
        <span class=""></span>Test
      </div>
      <div style="background: var(--bs-secondary); width: 50px; height: 50px">
        Test
      </div>
      <div style="background: var(--bs-tertiary); width: 50px; height: 50px">
        Test
      </div>
      <div style="background: var(--bs-body-color); width: 50px; height: 50px">
        Test
      </div>
    `
  })
}

// // More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default = {
}

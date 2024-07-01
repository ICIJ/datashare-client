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
      <div class="bg-primary" style="width: 50px; height: 50px; border: solid 1px black">
        Test
      </div>
      <div  class="bg-secondary" style="width: 50px; height: 50px; border: solid 1px black">
        Test
      </div>
      <div class="bg-tertiary" style="width: 50px; height: 50px; border: solid 1px black">
        Test
      </div>
      <div class="bg-body" style="width: 50px; height: 50px; border: solid 1px black">
        Test
      </div>
    `
  })
}

// // More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default = {}

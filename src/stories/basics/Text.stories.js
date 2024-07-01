export default {
  title: 'Basics/Text',
  render: (args) => ({
    // Components used in your story `template` are defined in the `components` object
    components: {},
    // The story's `args` need to be mapped into the template through the `setup()` method
    setup() {
      // Story args can be spread into the returned object
      return {
        args
      }
    },
    template: `
    H1 <h1>Title 1</h1>
    H2 <h2>Title 2</h2>
    H3 <h3>Title 3</h3>
    Text <p class="text">Text</p>
    Text muted <p class="text-muted">Text muted</p>
    `
  })
}

// // More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default = {}

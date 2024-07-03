export default {
  title: 'Layout/Colors',
  render: (args) => ({
    // The story's `args` need to be mapped into the template through the `setup()` method
    setup() {
      // Story args can be spread into the returned object
      return {
        args
      }
    },
    template: `
      <div class="p-3 mb-2 bg-primary text-bg-primary border border-dark fw-bold">
        <phosphor-icon name="Lego Smiley" />
        .bg-primary
      </div>
      <div class="p-3 mb-2 bg-primary-subtle text-primary-emphasis border border-dark fw-bold">
        <phosphor-icon name="Lego Smiley" />
        .bg-primary-subtle
      </div>
      <div class="p-3 mb-2 bg-secondary text-bg-secondary border border-secondary fw-bold">
        <phosphor-icon name="Lego Smiley" />
        .bg-secondary
      </div>
      <div class="p-3 mb-2 bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle fw-bold">
        <phosphor-icon name="Lego Smiley" />
        .bg-secondary-subtle
      </div>
      <div class="p-3 mb-2 bg-success text-bg-success border border-dark fw-bold">
        <phosphor-icon name="Lego Smiley" />
        .bg-success
      </div>
      <div class="p-3 mb-2 bg-success-subtle text-success-emphasis border border-dark fw-bold">
        <phosphor-icon name="Lego Smiley" />
        .bg-success-subtle
      </div>
      <div class="p-3 mb-2 bg-danger text-bg-danger border border-dark fw-bold">
        <phosphor-icon name="Lego Smiley" />
        .bg-danger
      </div>
      <div class="p-3 mb-2 bg-danger-subtle text-danger-emphasis border border-dark fw-bold">
        <phosphor-icon name="Lego Smiley" />
        .bg-danger-subtle
      </div>
      <div class="p-3 mb-2 bg-warning text-bg-warning border border-dark fw-bold">
        <phosphor-icon name="Lego Smiley" />
        .bg-warning
      </div>
      <div class="p-3 mb-2 bg-warning-subtle text-warning-emphasis border border-dark fw-bold">
        <phosphor-icon name="Lego Smiley" />
        .bg-warning-subtle
      </div>
      <div class="p-3 mb-2 bg-info text-bg-info border border-dark fw-bold">
        <phosphor-icon name="Lego Smiley" />
        .bg-info
      </div>
    `
  })
}

// // More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default = {}

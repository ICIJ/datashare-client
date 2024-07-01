import Icon from '@/components/Icon'

export default {
  title: 'Basics/Colors',
  render: (args) => ({
    components: {
      Icon
    },
    setup() {
      // Story args can be spread into the returned object
      return {
        args
      }
    },
    template: `
      <div class="p-3 mb-2 bg-primary text-white border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-primary
      </div>
      <div class="p-3 mb-2 bg-primary-subtle text-primary-emphasis border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-primary-subtle
      </div>
      <div class="p-3 mb-2 bg-secondary text-white border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-secondary
      </div>
      <div class="p-3 mb-2 bg-secondary-subtle text-secondary-emphasis border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-secondary-subtle
      </div>
      <div class="p-3 mb-2 bg-success text-white border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-success
      </div>
      <div class="p-3 mb-2 bg-success-subtle text-success-emphasis border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-success-subtle
      </div>
      <div class="p-3 mb-2 bg-danger text-white border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-danger
      </div>
      <div class="p-3 mb-2 bg-danger-subtle text-danger-emphasis border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-danger-subtle
      </div>
      <div class="p-3 mb-2 bg-warning text-dark border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-warning
      </div>
      <div class="p-3 mb-2 bg-warning-subtle text-warning-emphasis border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-warning-subtle
      </div>
      <div class="p-3 mb-2 bg-info text-dark border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-info
      </div>
      <div class="p-3 mb-2 bg-info-subtle text-info-emphasis border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-info-subtle
      </div>
      <div class="p-3 mb-2 bg-light text-dark border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-light
      </div>
      <div class="p-3 mb-2 bg-light-subtle text-light-emphasis border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-light-subtle
      </div>
      <div class="p-3 mb-2 bg-dark text-white border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-dark
      </div>
      <div class="p-3 mb-2 bg-dark-subtle text-dark-emphasis border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-dark-subtle
      </div>
      <div class="p-3 mb-2 bg-body-secondary border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-body-secondary
      </div>
      <div class="p-3 mb-2 bg-body-tertiary border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-body-tertiary
      </div>
      <div class="p-3 mb-2 bg-body text-body border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-body
      </div>
      <div class="p-3 mb-2 bg-black text-white border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-black
      </div>
      <div class="p-3 mb-2 bg-white text-dark border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-white
      </div>
      <div class="p-3 mb-2 bg-transparent text-body border border-dark fw-bold">
        <Icon icon="Lego Smiley" />
        .bg-transparent
      </div>
    `
  })
}

// // More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default = {}

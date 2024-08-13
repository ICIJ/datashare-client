import ImageMode from '@/components/ImageMode/ImageMode'
import ImageModeSource from '@/components/ImageMode/ImageModeSource'

export default {
  title: 'Components/ImageMode/ImageMode',
  component: ImageMode,
  args: {
    colorModes: ['light', 'dark'],
    defaultColorMode: 'light',
    imageClass: ['rounded-5', 'img-fluid', 'shadow-sm']
  },
  render: (args) => ({
    components: {
      ImageMode,
      ImageModeSource
    },
    setup() {
      return { args }
    },
    template: `
      <image-mode v-bind="args">
        <image-mode-source src="https://placehold.co/300x200/2f2e41/949fb6?text=dark&font=playfair-display" color-mode="dark" />
        <image-mode-source src="https://placehold.co/300x200/F3F5F8/112A5C?text=light&font=playfair-display" />
      </image-mode>
    `
  })
}

export const Default = {}

export const LocalTheme = {
  decorators: [
    (Story, { args }) => ({
      setup() {
        return { args }
      },
      template: `
        <div class="border d-flex">
          <div v-for="colorMode in args.colorModes" :key="colorMode" :data-bs-theme="colorMode" class="flex-grow-1">
            <div class="text-body bg-body p-4" style="background-color: var(--bs-body-bg)">
              <story />
            </div>
          </div>
        </div>
      `
    })
  ]
}

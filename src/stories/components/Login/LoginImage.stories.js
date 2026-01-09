import { ref } from 'vue'
import { ButtonIcon } from '@icij/murmur-next'

import IPhSpinnerGap from '~icons/ph/spinner-gap'

import LoginImage from '@/components/Login/LoginImage'

export default {
  title: 'Components/Login/LoginImage',
  component: LoginImage,
  render: () => ({
    components: {
      ButtonIcon,
      LoginImage,
      IPhSpinnerGap
    },
    setup() {
      const image = ref(null)
      return { image, IPhSpinnerGap }
    },
    template: `
      <div class="text-center">
        <login-image ref="image" class="my-5" />
        <button-icon label="Shake it!" :icon-left="IPhSpinnerGap" icon-left-weight="fill" @click="image.shake()" />
      </div>
    `
  })
}

export const Default = {}

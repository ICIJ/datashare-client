import { ref } from 'vue'
import { ButtonIcon } from '@icij/murmur-next'

import LoginImage from '@/components/Login/LoginImage'

export default {
  title: 'Components/Login/LoginImage',
  component: LoginImage,
  render: () => ({
    components: {
      ButtonIcon,
      LoginImage
    },
    setup() {
      const image = ref(null)
      return { image }
    },
    template: `
      <div class="text-center">
        <login-image ref="image" class="my-5" />
        <button-icon label="Shake it!" icon-left="disco-ball" icon-left-weight="fill" @click="image.shake()" />
      </div>
    `
  })
}

export const Default = {}

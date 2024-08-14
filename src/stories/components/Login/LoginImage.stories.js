import { ref } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'
import LoginImage from '@/components/Login/LoginImage'

export default {
  title: 'Components/Login/LoginImage',
  tags: ['autodocs'],
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

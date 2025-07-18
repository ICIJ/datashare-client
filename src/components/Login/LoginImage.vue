<script setup>
import { computed, ref } from 'vue'
import { ImageMode, ImageModeSource } from '@icij/murmur-next'

import image from '@/assets/images/illustrations/login-image-dark.svg'
import imageDark from '@/assets/images/illustrations/login-image-light.svg'
import logo from '@/assets/images/logo-color-symbol.svg'

const props = defineProps({
  shakingDuration: {
    type: Number,
    default: 750
  }
})

const shaking = ref(false)

const classList = computed(() => {
  return {
    'login-image--shaking': shaking.value
  }
})

const style = computed(() => {
  return {
    '--login-image-shaking-duration': `${props.shakingDuration}ms`
  }
})

async function shake() {
  shaking.value = true
  await new Promise((resolve) => setTimeout(resolve, props.shakingDuration))
  shaking.value = false
}

defineExpose({
  /**
   * Triggers a shaking animation on the Datashare logo.
   */
  shake
})
</script>

<template>
  <div class="login-image" :class="classList" :style="style">
    <image-mode class="login-image__bg">
      <image-mode-source :src="image" />
      <image-mode-source :src="imageDark" color-mode="dark" />
    </image-mode>
    <img :src="logo" alt="Datashare" class="login-image__logo" />
  </div>
</template>

<style lang="scss" scoped>
@keyframes shake {
  20% {
    transform: rotate3d(0, 0, 1, -15deg);
  }

  40% {
    transform: rotate3d(0, 0, 1, 10deg);
  }

  60% {
    transform: rotate3d(0, 0, 1, -5deg);
  }

  80% {
    transform: rotate3d(0, 0, 1, 5deg);
  }

  to {
    transform: rotate3d(0, 0, 1, 0deg);
  }
}

.login-image {
  --login-image-shaking-duration: 750;

  display: flex;
  margin: auto;
  max-width: 250px;
  position: relative;
  flex-shrink: 0;

  &--shaking &__logo {
    animation: shake var(--login-image-shaking-duration);
    transform: rotate3d(0, 0, 0);
  }

  &:before {
    content: '';
    display: block;
    padding-top: 100%;
  }

  &__logo {
    position: absolute;
    top: 24%;
    left: 19%;
    width: 20%;
    transform-origin: center center;
  }

  &__bg:deep(img) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }
}
</style>

<template>
  <span class="project-thumbnail" :style="style" :class="classList" :data-caption="caption">
    <span class="project-thumbnail__caption">{{ caption }}</span>
  </span>
</template>

<script>
import stringToColor from 'string-to-color'
import { compact } from 'lodash'

import { getConsonants } from '@/utils/strings'

/**
 * Generates a thumbnail for a given project
 */
export default {
  name: 'ProjectThumbnail',
  props: {
    /**
     * The project to use to generate the thumbnail. Can contain `name`, `label` and `logoUrl` which
     * will be used to generate the thumbnail consistently.
     */
    project: {
      type: Object,
      required: true
    },
    /**
     * Default width (and height) or the thumbnail which is always a square. Can be any valid CSS size.
     */
    width: {
      type: String,
      default: '100%'
    },
    /**
     * When set to true, the thumbnail appearance will be "checked".
     */
    checked: {
      type: Boolean
    },
    /**
     * Disable the caption generation.
     */
    noCaption: {
      type: Boolean
    }
  },
  computed: {
    abbr() {
      const name = this.captionBase
      const start = name.slice(0, 1)
      const end = name.slice(-1)
      const middleConsonants = getConsonants(name.slice(1, -1))
      const middle = middleConsonants[Math.floor(middleConsonants.length / 2)]
      return compact([start, middle, end]).join('')
    },
    caption() {
      if (this.noCaption || this.hasBackgroundWithLogo) {
        return null
      }
      return this.abbr.length === 3 ? this.abbr : this.captionBase.slice(0, 3)
    },
    captionBase() {
      return (this.project.label || this.project.name || '').toLowerCase()
    },
    background() {
      return this.hasBackgroundWithLogo ? this.backgroundWithLogo : this.backgroundWithoutLogo
    },
    backgroundWithLogo() {
      return `url("${this.project.logoUrl}") no-repeat center center #000`
    },
    backgroundWithoutLogo() {
      return this.backgroundColor
    },
    backgroundColor() {
      return this.hasBackgroundWithLogo ? '#000' : stringToColor(this.captionBase)
    },
    color() {
      if (this.checked) {
        return this.backgroundColor
      }
      return this.isForegroundDark ? '#000' : '#fff'
    },
    isForegroundDark() {
      const red = parseInt(this.background.substring(1, 3), 16)
      const green = parseInt(this.background.substring(3, 5), 16)
      const blue = parseInt(this.background.substring(5, 7), 16)
      const yiq = (red * 299 + green * 587 + blue * 114) / 1000
      return yiq >= 128
    },
    hasBackgroundWithLogo() {
      return !!this.project.logoUrl
    },
    style() {
      return { background: this.background, backgroundSize: 'cover', color: this.color, width: this.width }
    },
    classList() {
      return {
        'project-thumbnail--colorized': !this.hasBackgroundWithLogo,
        'project-thumbnail--checked': this.checked,
        'project-thumbnail--dark-foreground': this.isForegroundDark
      }
    }
  }
}
</script>

<style scoped lang="scss">
.project-thumbnail {
  display: inline-block;
  width: 100%;
  position: relative;
  container-type: inline-size;
  overflow: hidden;

  &:before {
    content: '';
    display: block;
    padding-top: 100%;
  }

  &:not(.project-thumbnail--checked).project-thumbnail--colorized {
    &:before {
      @include gradient-directional(rgba(#000, 0.25), rgba(#fff, 0.25));
    }

    .project-thumbnail__caption {
      font-family: $font-family-monospace;
      position: absolute;
      top: 50%;
      left: 50%;
      text-align: center;
      transform: translate(-50%, -50%);
      text-transform: uppercase;
      font-weight: bolder;
      font-size: 40cqw;
      line-height: 1;
      white-space: nowrap;
    }
  }

  &.project-thumbnail--checked {
    &:before {
      opacity: 0.5;
      background: #fff;
      border-radius: inherit;
    }

    &.project-thumbnail--dark-foreground:before {
      background: #000;
    }

    .project-thumbnail__caption {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      text-transform: uppercase;
      font-weight: bolder;
      font-size: 80cqw;
      line-height: 1;
      border: 5cqw solid currentColor;
      border-radius: inherit;
    }
  }
}
</style>

/** @type { import('@storybook/vue3').Preview } */

import './preview.scss'

import { useArgs } from '@storybook/preview-api'
import { styled } from '@storybook/theming'
import { withThemeByDataAttribute } from '@storybook/addon-themes'

const decorators = [
  withThemeByDataAttribute({
    themes: {
      light: 'light',
      dark: 'dark'
    },
    defaultTheme: 'light',
    attributeName: 'data-bs-theme'
  }),
  /**
   * Support `v-model` for vue
   * @see {@link https://craigbaldwin.com/blog/updating-args-storybook-vue/}
   */
  (story, context) => {
    const [args, updateArgs] = useArgs()
    if ('modelValue' in args) {
      const update = args['onUpdate:model-value'] || args['onUpdate:modelValue']
      args['onUpdate:model-value'] = undefined
      args['onUpdate:modelValue'] = (...vals) => {
        update?.(...vals)
        /**
         * Arg with `undefined` will be deleted by `deleteUndefined()`, then loss of reactive
         * @see {@link https://github.com/storybookjs/storybook/blob/next/code/lib/preview-api/src/modules/store/ArgsStore.ts#L63}
         */
        const modelValue = vals[0] === undefined ? null : vals[0]
        updateArgs({ modelValue })
      }
    }
    return story({ ...context, updateArgs })
  }
]


const style = {
  fontFamily: 'var(--bs-font-sans-serif) !important',
  fontSize: '1rem',
}

const headingsStyle = {
  fontFamily: 'var(--bs-font-sans-serif) !important',
  fontWeight: 'var(--bs-headings-weight-bold)'
}

const h1Style = {
  ...headingsStyle,
  fontSize: '2.5rem'
}

const aStyle = {
  ...style,
  color: 'rgba(var(--bs-link-color-rgb), var(--bs-link-opacity, 1));',
  '&:hover': {
    textDecoration: 'underline'
  }
}

const preview = {
  decorators,
  parameters: {
    docs: {
      components: {
        h1: styled.h1(() => h1Style),
        h2: styled.h2(() => headingsStyle),
        h3: styled.h3(() => headingsStyle),
        h4: styled.h4(() => headingsStyle),
        h5: styled.h5(() => headingsStyle),
        h6: styled.h6(() => headingsStyle),
        a: styled.a(() => aStyle),
        section: styled.section(() => style),
        p: styled.p(() => style),
        li: styled.li(() => style),
        div: styled.div(() => style),
        pre: styled.div(() => ({ })),
        span: styled.span(() => style),
        input: styled.input(() => style)
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview

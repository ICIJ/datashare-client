

import { create } from '@storybook/theming/create'
import brandImage from '../src/assets/images/logo-design-system.png'

export default create({
  base: 'light',
  brandTitle: 'Datashare design system',
  brandUrl: '?=/',
  brandTarget: '_self',
  brandImage,

  colorPrimary: '#193D87',
  colorSecondary: '#FA4070',

  // UI
  appBg: '#FFF',
  appContentBg: '#F0F0F0',
  appPreviewBg: '#FFF',
  appBorderColor: 'rgba(0,0,0, .175)',
  appBorderRadius: 4,

  // Fonts
  fontBase: '-apple-system, BlinkMacSystemFont, "Lato", "Source Sans Pro", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontCode: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',

  // Text colors
  textColor: '#000',
  textInverseColor: '#FFF',
  textMutedColor: '#717171',

  // Toolbar default and active colors
  barTextColor: '#333',
  barHoverColor: '#000',
  barSelectedColor: '#193D87',
  barBg: '#e9e9e9',

  // Form colors
  buttonBg: '#193D87',
  buttonBorder: 'rgba(0,0,0,.1)',
  booleanBg: '#fff',
  booleanSelectedBg: '#FA4070',
  inputBg: '#fff',
  inputBorder: 'rgba(0,0,0,.1)',
  inputTextColor: '#000',
  inputBorderRadius: 4
})

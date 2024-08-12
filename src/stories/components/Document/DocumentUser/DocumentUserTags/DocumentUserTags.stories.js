import uniqueId from 'lodash/uniqueId'

import DocumentUserTags from '@/components/Document/DocumentUser/DocumentUserTags/DocumentUserTags'

export default {
  title: 'Components/Document/DocumentUser/DocumentUserTags/DocumentUserTags',
  tags: ['autodocs'],
  decorators: [
    () => ({
      template: '<div style="min-height: 450px"><story /></div>'
    })
  ],
  component: DocumentUserTags,
  args: {
    modelValue: [],
    username: 'jsmith',
    options: ['toto', 'titi', 'tata'],
    listNameOthers: 'Added by others',
    listNameYours: 'Added by you'
  }
}

const tag = (tagName, username) => {
  return {
    tag: tagName,
    username
  }
}
const tagMine = (tagName) => tag(tagName, 'jsmith')
const tagOther = (tagName) => tag(tagName, uniqueId('other'))
const tags = [tagMine('toto'), tagMine('titi'), tagMine('tata'), tagOther('riri'), tagOther('fifi'), tagOther('loulou')]

export const Default = {}

export const WithTags = {
  args: {
    modelValue: tags,
    options: ['toto', 'titi', 'tata', 'test']
  }
}

export const IsServer = {
  args: {
    isServer: true
  }
}

export const IsServerWithTags = {
  args: {
    isServer: true,
    modelValue: tags
  }
}

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
    tags: [],
    username: 'jsmith',
    listNameOthers: 'Added by others',
    listNameYours: 'Added by you'
  }
}

const tag = (label, userId) => {
  const user = { id: userId }
  return { label, user }
}
const tagMine = (label) => tag(label, 'jsmith')
const tagOther = (label) => tag(label, uniqueId('other'))
const tags = [tagMine('toto'), tagMine('titi'), tagMine('tata'), tagOther('riri'), tagOther('fifi'), tagOther('loulou')]

export const Default = {}

export const WithTags = {
  args: {
    tags
  }
}

export const IsServer = {
  args: {
    tags: [],
    isServer: true
  }
}

export const IsServerWithTags = {
  args: {
    tags,
    isServer: true
  }
}

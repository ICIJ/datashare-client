import DocumentUserCommentsList from '@/components/Document/DocumentUser/DocumentUserComments/DocumentUserCommentsList'
import { withPinia } from '~storybook/decorators/pinia'

export default {
  title: 'Components/Document/DocumentUser/DocumentUserComments/DocumentUserCommentsList',
  tags: ['autodocs'],
  component: DocumentUserCommentsList,
  decorators: [withPinia()],
  args: {
    comments: [],
    to: () => 'http://example.com',
    hasNewest: false,
    hasOldest: false
  }
}

export const Default = {}

export const WithComments = {
  args: {
    hasNewest: false,
    hasOldest: true,
    comments: [
      {
        username: 'bfett',
        date: Date.now() - 150000000000,
        to: 'http://example.com',
        text: 'I would like to underline the role of the Galactic empress in creating the company as you can see here on this document page 65, paragraph 3. She says “I created the company in 2016 [...]”. This is very important to mention in the article that we plan to publish with the Guardian. cc @chorizo @tomatoe'
      },
      {
        username: 'lskywalker',
        date: Date.now() - 100000000000,
        to: 'http://example.com',
        text: "I'm not sure this is enough for the Vulkans to write the story. Wdyt @spoke?"
      },
      {
        username: 'spoke',
        date: Date.now(),
        to: 'http://example.com',
        text: 'May the force be with you 🖖'
      },
      {
        username: 'bfett',
        date: Date.now() - 50000000000,
        to: 'http://example.com',
        text: 'Did you have any info on the stargate ?'
      },
      {
        username: 'ttilk',
        date: Date.now() - 100000000000,
        to: 'http://example.com',
        text: 'This is a top secret information not sur tha @yoda would approve'
      },
      {
        username: 'byoda',
        date: Date.now(),
        to: 'http://example.com',
        text: 'The document number 101010001 you may read.'
      },
      {
        username: 'r2d2',
        date: Date.now(),
        to: 'http://example.com',
        text: 'BLIP!'
      }
    ]
  }
}

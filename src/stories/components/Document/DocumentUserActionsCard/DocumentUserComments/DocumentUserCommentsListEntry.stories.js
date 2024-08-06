import DocumentUserCommentsListEntry from '@/components/Document/DocumentUserActionsCard/DocumentUserComments/DocumentUserCommentsListEntry.vue'
import { storeDecoratorPipelineChainByCategory } from '~storybook/decorators/vuex'

export default {
  title: 'Components/Document/DocumentUserActionsCard/DocumentUserComments/DocumentUserCommentsListEntry',
  decorators: [storeDecoratorPipelineChainByCategory],
  tags: ['autodocs'],
  component: DocumentUserCommentsListEntry,
  args: {
    username: 'bfett',
    date: Date.now(),
    to: 'http://example.com',
    text: 'I would like to underline the role of the Galactic empress in creating the company as you can see here on this document page 65, paragraph 3. She says “I created the company in 2016 [...]”. This is very important to mention in the article that we plan to publish with the Guardian. cc @chorizo @tomatoe'
  }
}
export const Default = {}

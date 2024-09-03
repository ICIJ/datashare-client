import EntityPopoverTabs from '@/components/EntityPopover/EntityPopoverTabs'

export default {
  title: 'Components/EntityPopover/EntityPopoverTabs',
  component: EntityPopoverTabs,
  tags: ['autodocs'],
  args: {
    language: 'english',
    model: 'CoreNLP',
    mention: 'Bruno Mars',
    excerpt: 'Lorem ipsum Bruno Mars dolor ipset ',
    nbMentions: 5033,
    projects: ['banana papers', 'citrus confidential']
  }
}
export const Default = {}

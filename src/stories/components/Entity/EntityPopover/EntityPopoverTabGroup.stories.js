import EntityPopoverTabGroup from '@/components/EntityPopover/EntityPopoverTabGroup'

export default {
  title: 'Components/EntityPopover/EntityPopoverTabGroup',
  component: EntityPopoverTabGroup,
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

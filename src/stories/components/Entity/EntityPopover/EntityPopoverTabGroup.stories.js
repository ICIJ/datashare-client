import EntityPopoverTabGroup from '@/components/Entity/EntityPopover/EntityPopoverTabGroup'

export default {
  title: 'Components/Entity/EntityPopover/EntityPopoverTabGroup',
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

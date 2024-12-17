import EntityPopoverTabGroup from '@/components/Entity/EntityPopover/EntityPopoverTabGroup'

export default {
  title: 'Components/Entity/EntityPopover/EntityPopoverTabGroup',
  component: EntityPopoverTabGroup,
  tags: ['autodocs'],
  args: {
    language: 'english',
    extractor: 'CoreNLP',
    mention: 'Bruno Mars',
    excerpt: 'Lorem ipsum Bruno Mars dolor ipset ',
    offsets: 5033,
    projects: ['banana papers', 'citrus confidential']
  }
}
export const Default = {}

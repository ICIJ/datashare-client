export { default as WidgetDiskUsage } from './WidgetDiskUsage'
export { default as WidgetDocumentsByCreationDateByPath } from './WidgetDocumentsByCreationDateByPath'
export { default as WidgetDuplicates } from './WidgetDuplicates'
export { default as WidgetEmpty } from './WidgetEmpty'
export { default as WidgetEntities } from './WidgetEntities'
export { default as WidgetFileBarometer } from './WidgetFileBarometer'
export { default as WidgetListGroup } from './WidgetListGroup'
export { default as WidgetText } from './WidgetText'
export { default as WidgetTreeMap } from './WidgetTreeMap'

const widgets = [
  {
    name: 'default-text',
    order: 10,
    card: true,
    cols: 6,
    type: 'WidgetText',
    title: 'Insights'
  },
  {
    name: 'file-barometer',
    order: 20,
    card: true,
    cols: 3,
    type: 'WidgetFileBarometer'
  },
  {
    name: 'disk-usage',
    order: 30,
    card: true,
    cols: 3,
    type: 'WidgetDiskUsage'
  },
  {
    name: 'entities',
    order: 35,
    card: true,
    cols: 12,
    type: 'WidgetEntities'
  },
  {
    name: 'documents-by-creation-date',
    order: 40,
    card: true,
    cols: 12,
    type: 'WidgetDocumentsByCreationDateByPath',
    title: 'Number of documents by creation date'
  },
  {
    name: 'duplicates-in-documents',
    order: 50,
    card: true,
    cols: 12,
    type: 'WidgetDuplicates',
    title: 'Number of duplicates in your documents'
  },
  {
    name: 'default-list',
    order: 60,
    card: true,
    cols: 12,
    type: 'WidgetListGroup',
    title: 'More about data at ICIJ',
    items: [
      { label: 'How ICIJ will rock its tech in 2020', href: 'https://www.icij.org/blog/2020/01/how-icij-will-rock-its-tech-in-2020/', description: 'Technology and data are our never-ending stories at ICIJ. So, at the turn of this new decade, you could well be wondering: what is coming next?' },
      { label: 'What is Datashare? FAQs about our document analysis software', href: 'https://www.icij.org/blog/2019/11/what-is-datashare-frequently-asked-questions-about-our-document-analysis-software/', description: 'What makes ICIJ’s secure open-source software different from other tools? We answer some of the common questions about Datashare.' },
      { label: 'Explore company secrets in Lux Leaks using Datashare', href: 'https://www.icij.org/blog/2020/03/explore-company-secrets-in-lux-leaks-using-datashare/', description: 'You can now search our Lux Leaks documents without installing any software. Get a taste for how ICIJ’s network of investigative reporters works using Datashare online.' },
      { label: 'How we mined more than 715,000 Luanda Leaks records', href: 'https://www.icij.org/blog/2020/02/how-we-mined-more-than-715000-luanda-leaks-records/', description: 'Luanda Leaks was a trove of more than 175,000 emails – so how do we go about tackling such a massive dataset? And how can we be sure we haven’t missed major stories?' }
    ]
  }
]

export default widgets

import { useI18n } from 'vue-i18n'

export function useSearchSettings() {
  const { t } = useI18n()

  const propertiesOrder = [
    'thumbnail',
    'title',
    'highlights',
    'author',
    'path',
    'tags',
    'contentLength',
    'contentTextLength',
    'contentType',
    'creationDate',
    'extractionLevel',
    'language',
    'project'
  ]

  const propertiesLabel = {
    thumbnail: t('documentRow.properties.thumbnail'),
    title: t('documentRow.properties.title'),
    highlights: t('documentRow.properties.highlights'),
    author: t('documentRow.properties.author'),
    path: t('documentRow.properties.path'),
    tags: t('documentRow.properties.tags'),
    contentLength: t('documentRow.properties.contentLength'),
    contentTextLength: t('documentRow.properties.contentTextLength'),
    contentType: t('documentRow.properties.contentType'),
    creationDate: t('documentRow.properties.creationDate'),
    extractionLevel: t('documentRow.properties.extractionLevel'),
    language: t('documentRow.properties.language'),
    project: t('documentRow.properties.project')
  }

  const propertiesIcon = {
    thumbnail: null,
    title: 'file-text',
    highlights: 'quotes',
    author: 'user-circle',
    path: 'tree-structure',
    tags: 'hash',
    contentLength: 'file',
    contentTextLength: 'text-columns',
    contentType: 'file-text',
    creationDate: 'calendar',
    extractionLevel: 'note-blank',
    language: 'globe-hemisphere-west',
    project: 'circles-three-plus'
  }

  return { propertiesOrder, propertiesLabel, propertiesIcon }
}

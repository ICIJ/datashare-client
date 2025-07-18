import { compact, endsWith, filter, find, get, keys, last, pick, startsWith, trim } from 'lodash'
import { markRaw } from 'vue'
import Murmur from '@icij/murmur-next'
import dayjs from 'dayjs'
import { extname } from 'path'

import { Api } from '@/api'
import EsDoc from '@/api/resources/EsDoc'
import humanSize from '@/utils/humanSize'
import { findContentTypeIcon } from '@/utils/iconFiles'
import types from '@/utils/contentTypes.json'

const _parent = '_PARENT'
const _root = '_ROOT'
const _position = '_POSITION'
const _separator = '/'

export default class Document extends EsDoc {
  constructor(raw, parent = null, root = null, position = 0) {
    super(raw)
    this.parent = parent
    this.root = root
    this.position = position
  }
  nl2br(str) {
    return trim(str)
      .split('\n')
      .map((row) => `<p>${row}</p>`)
      .join('')
  }
  translationIn(targetLanguage) {
    return find(this.translations, { target_language: targetLanguage })
  }
  translatedContentIn(targetLanguage) {
    const translation = this.translationIn(targetLanguage)
    return translation ? translation.content : null
  }
  meta(name, defaultValue) {
    const tikaMetadataName = `metadata.tika_metadata_${this.shortMetaName(name)}`
    return get(this.source, tikaMetadataName, defaultValue)
  }
  valueAsQueryParam(name, value) {
    return `${name}:"${value}"`
  }
  metaAsQueryParam(name, defaultValue) {
    const rawName =
      name in this.raw || name in this.raw?._source ? name : `metadata.tika_metadata_${this.shortMetaName(name)}`

    return this.valueAsQueryParam(rawName, this.meta(name, defaultValue))
  }
  shortMetaName(name) {
    return name.replace('tika_metadata_', '')
  }
  set position(position) {
    this[_position] = isNaN(position) ? null : position
  }
  get position() {
    return this[_position]
  }
  set parent(parent) {
    this[_parent] = parent ? new Document(parent) : null
  }
  get parent() {
    return this[_parent]
  }
  set root(root) {
    this[_root] = root ? new Document(root) : null
  }
  get root() {
    return this[_root]
  }
  get content() {
    return this.get('_source.content')
  }
  set content(content) {
    this.set('_source.content', content)
  }
  get metadata() {
    return keys(this.source.metadata || {})
  }
  get shortId() {
    return this.id.slice(0, 10)
  }
  get path() {
    return this.get('_source.path', '')
  }
  get tags() {
    return this.get('_source.tags', [])
  }
  get folder() {
    // Extract location parts
    const pathSeparator = Murmur.config.get('pathSeparator', _separator)
    const parts = this.path.split(pathSeparator)
    // Remove the file name
    parts.splice(-1, 1)
    // And return the new path
    return parts.join(pathSeparator) + pathSeparator
  }
  get location() {
    return this.folder.split(Murmur.config.get('dataDir', import.meta.env.VITE_DATA_PREFIX)).pop()
  }
  get basename() {
    return last(this.path.split(Murmur.config.get('pathSeparator', _separator)))
  }
  get extension() {
    return extname(this.basename).toLowerCase()
  }
  get resourceName() {
    let resourceName = trim(this.get('_source.metadata.tika_metadata_resourcename', this.shortId))
    if (startsWith(resourceName, '=?') && endsWith(resourceName, '?=')) {
      const resourceNameArray = resourceName.split('?')
      resourceName = unescape(resourceNameArray[resourceNameArray.length - 2].replace(/=/g, '%'))
    }
    return resourceName
  }
  get title() {
    const title = this.get('_source.title', null)
    const resourceName = this.extractionLevel ? this.resourceName : null
    const titles = [this.shortId, this.basename, resourceName, title]
    return last(compact(titles))
  }
  get titleNorm() {
    return this.get('_source.titleNorm', null)
  }
  get subject() {
    const titles = [this.title]
    if (this.isEmail) {
      titles.push(trim(this.get('_source.metadata.tika_metadata_dc_title', '')))
      const subject =
        this.get('_source.metadata.tika_metadata_subject', null) ??
        this.get('_source.metadata.tika_metadata_dc_subject', '')
      titles.push(trim(subject))
    }
    if (this.isTweet) {
      titles.push(trim(this.get('_source.metadata.tika_metadata_dc_title', '')))
    }
    return last(compact(titles))
  }
  get cleanSubject() {
    return this.subject.replace(/((.{1,4})\s?:\s?)*(.+)/i, '$3')
  }
  get slicedName() {
    if (this.extractionLevel === 0) {
      return [this.title]
    }
    const distance = this.get('_source.extractionLevel') - 1
    // Sliced name for extracted doc is composed of:
    // - root title (if available)
    // - distance with the top parent
    // - the document title
    return [this.basename].concat([distance].slice(0, distance)).concat(this.title)
  }
  get slicedNameToString() {
    return this.slicedName.join(' › ')
  }
  get language() {
    return this.get('_source.language')
  }
  get author() {
    return this.get('_source.metadata.tika_metadata_dc_creator', null)
  }
  get highlight() {
    return this.raw.highlight
  }
  get excerpt() {
    const content = this.get(['highlight', 'content', 0], '')
    const contentTranslated = this.get(['highlight', 'content_translated.content', 0], '')
    return trim(content || contentTranslated)
  }
  get highlights() {
    const content = this.get(['highlight', 'content'], [])
    const contentTranslated = this.get(['highlight', 'content_translated.content'], [])
    return [...content, ...contentTranslated]
  }
  get route() {
    return `/ds/${this.index}/${this.id}/${this.routing}`
  }
  get url() {
    return `/api/${this.index}/documents/src/${this.id}?routing=${this.routing}`
  }
  get fullUrl() {
    return Api.getFullUrl(this.url)
  }
  get inlineFullUrl() {
    const url = new URL(this.fullUrl)
    url.searchParams.set('inline', true)
    return url.href
  }
  get rootUrl() {
    return `/api/${this.index}/documents/src/${this.routing}?routing=${this.routing}`
  }
  get fullRootUrl() {
    return Api.getFullUrl(this.rootUrl)
  }
  get numberOfPages() {
    const raw = this.meta('xmptpg_npages', null)
    return raw ? parseInt(raw, 10) : null
  }
  get contentType() {
    return this.source.contentType || 'unknown'
  }
  get contentTypeLabel() {
    return get(types, [this.contentType, 'label'], null)
  }
  get contentTypeDescription() {
    return get(types, [this.contentType, 'description'], {})
  }
  get contentTypeWarning() {
    return get(types, [this.contentType, 'warning'], {})
  }
  get contentTypeIcon() {
    return markRaw(findContentTypeIcon(this.contentType))
  }
  get rootContentType() {
    return this.root ? this.root.source.contentType : 'unknown'
  }
  get rootContentTypeLabel() {
    return get(types, [this.rootContentType, 'label'], null)
  }
  get standardExtension() {
    return get(types, [this.contentType, 'extensions', 0], null)
  }
  get standardExtensions() {
    return get(types, [this.contentType, 'extensions'], [])
  }
  get hasStandardExtension() {
    return this.standardExtensions.indexOf(this.extension) > -1
  }
  get hasContentTypeWarning() {
    return !!get(types, [this.contentType, 'warning'], false)
  }
  get hasContent() {
    return this.get('_source.content', null) !== null
  }
  get hasTranslatedContent() {
    return this.get('_source.content_translated', null) !== null
  }
  get hasSubject() {
    return this.subject && this.subject !== this.title
  }
  get creationDate() {
    const creationDate = this.source?.metadata?.tika_metadata_dcterms_created
    if (creationDate && !isNaN(Date.parse(creationDate))) {
      return new Date(creationDate)
    } else {
      return null
    }
  }
  get creationDateHuman() {
    return this.creationDate ? dayjs(this.creationDate).format('LLL') : null
  }
  get creationDateHumanShort() {
    return this.creationDate ? dayjs(this.creationDate).format('L LT') : null
  }
  get extractionLevel() {
    return this.get('_source.extractionLevel', 0)
  }
  get contentTextLength() {
    return this.get('_source.contentTextLength', 0)
  }
  get contentLength() {
    return this.get('_source.contentLength')
  }
  get humanSize() {
    return humanSize(this.contentLength, true)
  }
  get routerParams() {
    return pick(this, ['index', 'id', 'routing'])
  }
  get serializedForStorage() {
    return pick(this.raw, [
      '_id',
      '_routing',
      '_version',
      '_index',
      '_source.path',
      '_source.extractionLevel',
      '_source.contentLength',
      '_source.contentType',
      '_source.metadata.tika_metadata_subject',
      '_source.metadata.tika_metadata_dc_subject',
      '_source.metadata.tika_metadata_dc_title'
    ])
  }
  get threadIndex() {
    return this.get('_source.metadata.tika_metadata_message_raw_header_thread_index', null)
  }
  get messageId() {
    return this.get('_source.metadata.tika_metadata_message_raw_header_message_id', null)
  }
  get messageFrom() {
    return this.get('_source.metadata.tika_metadata_message_from', null)
  }
  get messageTo() {
    return this.get('_source.metadata.tika_metadata_message_to', null)
  }
  set translations(translations) {
    this.set('_source.content_translated', translations)
  }
  get translations() {
    const translations = this.get('_source.content_translated', [])
    return filter(translations, (t) => t.content !== '')
  }
  get isEmail() {
    return this.contentType.indexOf('message/') === 0 || this.contentType === 'application/vnd.ms-outlook'
  }
  get isTweet() {
    return this.contentType === 'application/json; twint'
  }
  get isPdf() {
    return this.contentType === 'application/pdf'
  }
  get isTiff() {
    return this.contentType === 'image/tiff'
  }
  get isSpreadsheet() {
    const spreadsheetTypes = [
      'application/vnd.oasis.opendocument.spreadsheet',
      'application/vnd.oasis.opendocument.spreadsheet-template',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
      'text/csv'
    ]
    return spreadsheetTypes.indexOf(this.contentType) > -1
  }
  get isSupportedImage() {
    const imageTypes = [
      'image/apng',
      'image/avif',
      'image/gif',
      'image/jpeg',
      'image/png',
      'image/svg+xml',
      'image/webp'
    ]
    return imageTypes.indexOf(this.contentType) > -1
  }
  get isImage() {
    return this.contentType.indexOf('image/') === 0
  }
  get isVideo() {
    return this.contentType.indexOf('video/') === 0
  }
  get isAudio() {
    return this.contentType.indexOf('audio/') === 0
  }
  get isJson() {
    return this.contentType.indexOf('application/json') === 0
  }
  get hasTranslations() {
    return this.translations.length > 0
  }
  get hasNerTags() {
    return this.get('_source.nerTags', []).length > 0
  }
  get hasBigContentTextLength() {
    // 50,000 characters
    return this.contentTextLength === undefined || this.contentTextLength === 0 || this.contentTextLength > 5e4
  }
  static get esName() {
    return 'Document'
  }
  static create(raw) {
    return new Document(raw)
  }
}

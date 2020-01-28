import types from '@/utils/types.json'
import { findIcon, defaultIcon } from '@/utils/font-awesome-files'
import Api from '../index'
import EsDoc from '../EsDoc'
import moment from 'moment'
import { extname } from 'path'
import Murmur from '@icij/murmur'

import cloneDeep from 'lodash/cloneDeep'
import compact from 'lodash/compact'
import endsWith from 'lodash/endsWith'
import find from 'lodash/find'
import filter from 'lodash/filter'
import keys from 'lodash/keys'
import get from 'lodash/get'
import last from 'lodash/last'
import pick from 'lodash/pick'
import some from 'lodash/some'
import startsWith from 'lodash/startsWith'
import trim from 'lodash/trim'
import truncate from 'lodash/truncate'

const _parent = '_PARENT'

export default class Document extends EsDoc {
  constructor (raw, parent = null) {
    super(raw)
    this.setParent(parent)
  }
  setParent (parent) {
    this[_parent] = parent ? new Document(parent) : null
  }
  nl2br (str) {
    return trim(str).split('\n').map(row => `<p>${row}</p>`).join('')
  }
  hasTranslationsIn (targetLanguage) {
    return some(this.translations, { target_language: targetLanguage })
  }
  translationIn (targetLanguage) {
    return find(this.translations, { target_language: targetLanguage })
  }
  translatedContentIn (targetLanguage) {
    const translation = this.translationIn(targetLanguage)
    return translation ? translation.content : null
  }
  meta (name, defaultValue) {
    const tikaMetadataName = `metadata.tika_metadata_${this.shortMetaName(name)}`
    return get(this.source, tikaMetadataName, defaultValue)
  }
  valueAsQueryParam (name, value) {
    return `${name}:"${value}"`
  }
  metaAsQueryParam (name, defaultValue) {
    const tikaMetadataName = `metadata.tika_metadata_${this.shortMetaName(name)}`
    return this.valueAsQueryParam(tikaMetadataName, this.meta(name, defaultValue))
  }
  shortMetaName (name) {
    return name.replace('tika_metadata_', '')
  }
  get metas () {
    return keys(this.source.metadata || {})
  }
  get parent () {
    return this[_parent]
  }
  get shortId () {
    return this.id.slice(0, 10)
  }
  get path () {
    return this.get('_source.path', '')
  }
  get tags () {
    return this.get('_source.tags', [])
  }
  get folder () {
    // Extract location parts
    let parts = this.path.split('/')
    // Remove the file name
    parts.splice(-1, 1)
    // And return the new path
    return parts.join('/') + '/'
  }
  get location () {
    return this.folder.split(Murmur.config.get('dataDir', process.env.VUE_APP_DATA_PREFIX)).pop()
  }
  get basename () {
    return last(this.path.split('/'))
  }
  get extension () {
    return extname(this.basename).toLowerCase()
  }
  get resourceName () {
    let resourceName = trim(this.get('_source.metadata.tika_metadata_resourcename', this.shortId))
    if (startsWith(resourceName, '=?') && endsWith(resourceName, '?=')) {
      const resourceNameArray = resourceName.split('?')
      resourceName = unescape(resourceNameArray[resourceNameArray.length - 2].replace(/=/g, '%'))
    }
    return resourceName
  }
  get title () {
    const titles = [ this.shortId, this.basename ]
    if (this.isEmail) {
      titles.push(trim(this.get('_source.metadata.tika_metadata_dc_title', '')))
      titles.push(trim(this.get('_source.metadata.tika_metadata_subject', '')))
    }
    if (this.isTweet) {
      titles.push(trim(this.get('_source.metadata.tika_metadata_dc_title', '')))
    }
    if (this.extractionLevel > 0) {
      titles.push(this.resourceName)
    }
    return last(compact(titles))
  }
  get cleanSubject () {
    return this.title.replace(/((.{1,4})\s?:\s?)*(.+)/i, '$3')
  }
  get slicedName () {
    if (this.extractionLevel === 0) {
      return [ this.title ]
    }
    const distance = this.get('_source.extractionLevel') - 1
    // Sliced name for extracted doc is composed of:
    // - root title (if available)
    // - distance with the top parent
    // - the document title
    const root = this.parent ? truncate(this.parent.title, { length: 30 }) : this.basename
    return [ root ].concat([ distance ].slice(0, distance)).concat(this.title)
  }
  get highlight () {
    return this.raw.highlight
  }
  get url () {
    return `/api/${this.index}/documents/src/${this.id}?routing=${this.routing}`
  }
  get fullUrl () {
    return Api.getFullUrl(this.url)
  }
  get contentType () {
    return this.source.contentType || 'unknown'
  }
  get contentTypeLabel () {
    return get(types, [this.contentType, 'label'], null)
  }
  get contentTypeDescription () {
    return get(types, [this.contentType, 'description'], {})
  }
  get contentTypeWarning () {
    return get(types, [this.contentType, 'warning'], {})
  }
  get contentTypeIcon () {
    const extensions = get(types, [this.contentType, 'extensions'], [])
    const icon = get(types, [this.contentType, 'icon'], null)
    return icon ? findIcon(icon) : find(extensions.map(findIcon)) || defaultIcon
  }
  get standardExtension () {
    return get(types, [this.contentType, 'extensions', 0], null)
  }
  get standardExtensions () {
    return get(types, [this.contentType, 'extensions'], [])
  }
  get hasStandardExtension () {
    return this.standardExtensions.indexOf(this.extension) > -1
  }
  get hasContentTypeWarning () {
    return !!get(types, [this.contentType, 'warning'], false)
  }
  get creationDate () {
    const creationDate = this.source.metadata.tika_metadata_creation_date
    if (creationDate && !isNaN(Date.parse(creationDate))) {
      return new Date(creationDate)
    } else {
      return null
    }
  }
  get creationDateHuman () {
    return this.creationDate ? moment(this.creationDate).format('LLL') : null
  }
  get extractionLevel () {
    return this.get('_source.extractionLevel', 0)
  }
  get humanSize () {
    if (this.source.contentLength === -1) return 'unknown'
    let size = this.source.contentLength
    let unitIndex = Math.floor(size === 0 ? 0 : Math.log(size) / Math.log(1024))
    let value = (size / Math.pow(1024, unitIndex)).toFixed(2)
    let unit = ['B', 'kB', 'MB', 'GB', 'TB'][unitIndex]
    return unitIndex === 0 ? `${size} B` : `${value} ${unit} (${size} B)`
  }
  get index () {
    return this.raw._index
  }
  get routerParams () {
    return pick(this, ['index', 'id', 'routing'])
  }
  get serializedForStorage () {
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
      '_source.metadata.tika_metadata_dc_title'
    ])
  }
  get threadIndex () {
    return this.get('_source.metadata.tika_metadata_message_raw_header_thread_index', null)
  }
  get messageId () {
    return this.get('_source.metadata.tika_metadata_message_raw_header_message_id', null)
  }
  get messageFrom () {
    return this.get('_source.metadata.tika_metadata_message_from', null)
  }
  get messageTo () {
    return this.get('_source.metadata.tika_metadata_message_to', null)
  }
  get excerpt () {
    return truncate(trim(this.source.content), { length: 280 })
  }
  get translations () {
    const translations = this.get('_source.content_translated', [])
    return filter(translations, t => t.content !== '')
  }
  get translationsHtml () {
    return cloneDeep(this.translations).map(translation => {
      translation['content'] = this.nl2br(translation['content'])
      return translation
    })
  }
  get isEmail () {
    return this.contentType.indexOf('message/') === 0 || this.contentType === 'application/vnd.ms-outlook'
  }
  get isTweet () {
    return this.contentType === 'application/json; twint'
  }
  get isPdf () {
    return this.contentType === 'application/pdf'
  }
  get isTiff () {
    return this.contentType === 'image/tiff'
  }
  get isSpreadsheet () {
    return ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'].indexOf(this.contentType) > -1
  }
  get isImage () {
    return this.contentType.indexOf('image/') === 0
  }
  get hasTranslations () {
    return this.translations.length > 0
  }
  get hasNerTags () {
    return this.get('_source.nerTags', []).length > 0
  }
  static get esName () {
    return 'Document'
  }
  static create (raw) {
    return new Document(raw)
  }
}

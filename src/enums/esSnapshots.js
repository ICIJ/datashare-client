// Repository types for Elasticsearch snapshots
const FS = 'fs'
const S3 = 's3'
const AZURE = 'azure'
const GCS = 'gcs'
const HDFS = 'hdfs'
const URL = 'url'

export const ES_SNAPSHOT_REPOSITORY_TYPE = Object.freeze({
  FS,
  S3,
  AZURE,
  GCS,
  HDFS,
  URL
})

export const ES_SNAPSHOT_REPOSITORY_TYPE_LIST = Object.values(ES_SNAPSHOT_REPOSITORY_TYPE)
export const esSnapshotRepositoryTypeValidator = v => ES_SNAPSHOT_REPOSITORY_TYPE_LIST.includes(v)

// Snapshot constants
export const ES_SNAPSHOT_DEFAULT_REPOSITORY = 'datashare_backup'
export const ES_SNAPSHOT_NAME_PATTERN = /^(snapshot-\d+)(?:-([^-]+))?(?:-([^-]+))?$/

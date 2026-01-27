const FS = 'fs'
const S3 = 's3'
const AZURE = 'azure'
const GCS = 'gcs'
const HDFS = 'hdfs'
const URL = 'url'

export const REPOSITORY_TYPE = Object.freeze({
  FS,
  S3,
  AZURE,
  GCS,
  HDFS,
  URL
})

export const REPOSITORY_TYPE_LIST = Object.values(REPOSITORY_TYPE)
export const repositoryTypeValidator = v => REPOSITORY_TYPE_LIST.includes(v)

export function useContentType() {
  const image = ['image/png', 'image/jpeg', 'image/gif', 'image/bmp', 'image/svg+xml', 'image/webp', 'image/tiff']
  const text = ['text/plain', 'application/rtf', 'application/vnd.oasis.opendocument.text']
  const pdf = ['application/pdf']
  const document = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  const spreadsheet = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
  const presentation = [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
  const archive = [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip'
  ]
  const audio = ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/flac', 'audio/ogg', 'audio/mp4']
  const video = [
    'video/mp4',
    'video/quicktime',
    'video/x-ms-wmv',
    'video/x-msvideo',
    'video/x-flv',
    'video/x-matroska',
    'video/webm',
    'video/mpeg'
  ]
  const code = [
    'application/javascript', // js
    'text/css', // css
    'text/html', // html
    'text/x-python', // py
    'application/sql' // sql
  ]
  const email = ['message/rfc822', 'application/vnd.ms-outlook', 'application/vnd.ms-tnef']

  const umbrellaTypes = {
    archive,
    audio,
    code,
    document,
    email,
    image,
    pdf,
    presentation,
    spreadsheet,
    text,
    video
  }
  const defaultIcon = 'file'
  const umbrellaIcons = {
    archive: 'file-archive',
    audio: 'file-audio',
    code: 'file-code',
    document: 'file-doc',
    email: defaultIcon,
    image: 'file-image',
    pdf: 'file-pdf',
    presentation: 'file-ppt',
    spreadsheet: 'file-spreadsheet',
    text: 'file-txt',
    video: 'file-video',
    default: defaultIcon
  }

  function getUmbrellaTypes() {
    return Object.keys(umbrellaTypes)
  }

  function getUmbrellaIcon(contentType) {
    for (const [umbrella, extensions] of Object.entries(umbrellaTypes)) {
      if (extensions.includes(contentType.toLowerCase())) {
        return umbrellaIcons[umbrella]
      }
    }
    return umbrellaIcons.default
  }

  return { getUmbrellaTypes, getUmbrellaIcon }
}

export const ROTATIONS = [0, 90, 180, 270]
export const ROTATIONS_COUNTERWISE = [0, 270, 180, 90]

export const SCALE_FIT = 'fit'
export const SCALE_WIDTH = 'width'
export const SCALES = [
  { value: SCALE_FIT, text: 'documentViewerPdf.scale.fit' },
  { value: SCALE_WIDTH, text: 'documentViewerPdf.scale.width' },
  { value: 0.5, text: '50%' },
  { value: 0.75, text: '75%' },
  { value: 1, text: '100%' },
  { value: 1.25, text: '125%' },
  { value: 1.5, text: '150%' },
  { value: 2, text: '200%' },
  { value: 3, text: '300%' },
  { value: 4, text: '400%' }
]

// Mirrors PDF_CONTENT_TYPES in datashare-preview (>= 1.7), the types its /api/v1/pdf endpoint converts.
export const PDF_CONVERTIBLE_CONTENT_TYPES = [
  'application/msword',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint.presentation.macroenabled.12',
  'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.presentation',
  'application/rtf',
  'text/rtf'
]

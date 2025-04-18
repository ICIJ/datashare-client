import contentTypes from '@/utils/contentTypes.json'
import models from '@/utils/models.json'
import modelsDisplay from '@/utils/modelsDisplay.json'

export function useSchema() {
  const FALLBACK_MODEL = 'Document'
  const FALLBACK_MODEL_DISPLAY = 'Document'

  function getModel(name) {
    return models[name]
  }

  function getModelDisplay(name) {
    return modelsDisplay[name] ?? modelsDisplay[FALLBACK_MODEL_DISPLAY]
  }

  function getContentTypeModel(contentType) {
    return getModel(contentTypes[contentType]?.model ?? FALLBACK_MODEL)
  }

  function getContentTypeDisplay(contentType) {
    return getModelDisplay(contentTypes[contentType]?.model ?? FALLBACK_MODEL)
  }

  return {
    models,
    modelsDisplay,
    getModel,
    getModelDisplay,
    getContentTypeModel,
    getContentTypeDisplay
  }
}

import settings from './handlers/settings'
import auth from './handlers/auth'
import documents from './handlers/documents'

// Default MSW handlers applied to every story. Stories override individual
// endpoints via `parameters.msw.handlers` (merged over these by the addon).
export const defaultHandlers = [...settings, ...auth, ...documents]

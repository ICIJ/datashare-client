import { http, HttpResponse } from 'msw'

// Empty-collection handler for a path — for `--no-results` / empty-state stories.
export const emptyJson = (pattern, method = 'get', body = []) =>
  http[method](pattern, () => HttpResponse.json(body))

// Error handler for a path — for `--error` stories.
export const errorJson = (pattern, status = 500, method = 'get') =>
  http[method](pattern, () => new HttpResponse(null, { status }))

import { http, HttpResponse } from 'msw'
import recommendations from '../fixtures/recommendations.json'
import tags from '../fixtures/tags.json'
export default [
  http.get('*/api/:project/pathBanners', () => HttpResponse.json([])),
  http.get('*/api/users/recommendations', () => HttpResponse.json(recommendations)),
  http.get('*/api/:project/documents/recommendations', () => HttpResponse.json([])),
  http.get('*/api/document-user-recommendation/', () => HttpResponse.json({ aggregates: [], totalCount: 0 })),
  http.get('*/api/:project/documents/tags/:documentId', () => HttpResponse.json(tags))
]

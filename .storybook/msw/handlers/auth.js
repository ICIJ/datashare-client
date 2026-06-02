import { http, HttpResponse } from 'msw'
import user from '../fixtures/user.json'
export default [
  http.get('*/api/users/me', () => HttpResponse.json(user)),
  http.get('*/api/users/me/permissions', () => HttpResponse.json([]))
]

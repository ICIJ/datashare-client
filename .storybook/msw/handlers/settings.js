import { http, HttpResponse } from 'msw'
import settings from '../fixtures/settings.json'
export default [http.get('*/api/settings', () => HttpResponse.json(settings))]

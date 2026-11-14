import { http, HttpResponse } from 'msw'
import model from '../fixtures/structuredEntityModel.json'

// A trimmed FollowTheMoney ontology: Person and Company feature different properties, which is
// what makes the entity card stories show different rows per schema.
export default [http.get('*/api/models/*', () => HttpResponse.json(model))]

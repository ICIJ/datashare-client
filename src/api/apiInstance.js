import axios from 'axios'

import { EventBus } from '@/utils/eventBus'
import { Api } from '@/api'
import { elasticsearch } from '@/api/elasticsearch'

axios.defaults.xsrfCookieName = '_ds_csrf_token'
axios.defaults.xsrfHeaderName = 'X-DS-CSRF-TOKEN'

export const apiInstance = new Api(axios, EventBus, elasticsearch)

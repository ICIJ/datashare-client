import axios from 'axios'

import { EventBus } from '@/utils/eventBus'
import { Api } from '@/api'
import { elasticsearch } from '@/api/elasticsearch'
import settings from '@/utils/settings'

axios.defaults.xsrfCookieName = settings.csrf.cookieName
axios.defaults.xsrfHeaderName = settings.csrf.headerName

export const apiInstance = new Api(axios, EventBus, elasticsearch)

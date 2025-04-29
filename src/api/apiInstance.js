import axios from 'axios'

import { EventBus } from '@/utils/eventBus'
import { Api } from '@/api'
import { elasticsearch } from '@/api/elasticsearch'

export const apiInstance = new Api(axios, EventBus, elasticsearch)

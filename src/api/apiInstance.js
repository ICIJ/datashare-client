import axios from 'axios'

import { EventBus } from '@/utils/event-bus'
import { Api } from '@/api'
import elasticsearch from '@/api/elasticsearch'

export const apiInstance = new Api(axios, EventBus, elasticsearch)

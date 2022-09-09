import axios from 'axios'
import { EventBus } from '@/utils/event-bus'
import { Api } from '@/api'

export const apiInstance = new Api(axios, EventBus)

import { DevTools } from 'app/libs/tools/dev-tools.class'
import axios, { AxiosResponse } from 'axios'

interface IOpenAiResponse {
  id: string
  object: string
  created: number // timestamp
  model: string
  usage: {
      prompt_tokens: number
      completion_tokens: number
      total_tokens: number
  }
  choices: [
      {
          message: {
              role: 'assistant' | 'user'
              content: string
          }
          finish_reason: 'stop'
          index: number
      }
  ]
}

interface IGptPayload {
  content: string
  role: 'system' | 'assistant' | 'user'
}

export interface IAssistantHistory {
  queries: Array<string>
  responses: Array<string>
}

const FORCE_IN_DEV_MODE = false
const DEBUG = DevTools.isReactDev() && !FORCE_IN_DEV_MODE

const randomStringThatLooksLikeAnAnswer = () => {
  const numberOfWords = Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10)
  let result = ''
  for (let i = 0; i < numberOfWords; i++) {
    result += Math.random().toString(36).substring(2, 15) + ' '
  }
  return result
}

const preparedResponses = [
  'To set an element to full width in Tailwind, you can use the `w-full` class. This class will make the element take up the full width of its parent container. You can also add the `max-w-full` class to ensure the element takes up the full width even on larger screens.\n\nHere\'s an example of how to use it:\n\n```html\n<div class="w-full max-w-full">\n<!-- Your content here -->\n</div>\n```',
  'To set a background color in Tailwind, you can use the `bg-` prefix followed by the name of the color. For example, to set a red background color, you would use the class `bg-red-500`.\n\nHere\'s an example:\n\n```\n<div class="w-full bg-red-500">\nThis element will take up the full width of its container and have a red background color.\n</div>\n```\n\nYou can find a list of all the built-in colors in Tailwind in the official documentation: https://tailwindcss.com/docs/background-color'
]

const OPEN_AI_URL = 'https://api.openai.com/v1/chat/completions'

export const fetchFromOpenAI = async (apiKey: string, history: IAssistantHistory): Promise<string> => {
  if (DEBUG) {
    if (preparedResponses[history.queries.length - 1]) {
      return preparedResponses[history.queries.length - 1]
    }
    return randomStringThatLooksLikeAnAnswer()
  }
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  }

  const messages: Array<IGptPayload> = [{ role: 'system', content: 'You are a helpful assistant.' }]

  if (history.queries.length > 0) {
    for (let i = 0; i < history.queries.length; i++) {
      messages.push({
        content: history.queries[i],
        role: 'user'
      })
      if (history.responses[i]) {
        messages.push({
          content: history.responses[i],
          role: 'assistant'
        })
      }
    }
  }

  const data = {
    model: 'gpt-3.5-turbo',
    messages
  }

  const response = await axios.post<any, AxiosResponse<IOpenAiResponse>>(OPEN_AI_URL, data, { headers })
  const text = response.data?.choices?.[0]?.message?.content || ''
  return text.replace(/^\n+/, '')
}

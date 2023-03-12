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

export const fetchFromOpenAI = async (inputText: string, apiKey: string, history: IAssistantHistory): Promise<string> => {
  const openAiUrl = 'https://api.openai.com/v1/chat/completions'
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  }

  const messages: Array<IGptPayload> = []

  if (history.queries.length > 0) {
    for (let i = 0; i < history.queries.length; i++) {
      messages.push({
        content: history.queries[i],
        role: 'user'
      })
      messages.push({
        content: history.responses[i],
        role: 'assistant'
      })
    }
  }

  messages.push({
    content: inputText,
    role: 'user'
  })

  const data = {
    model: 'gpt-3.5-turbo',
    messages
  }

  const response = await axios.post<any, AxiosResponse<IOpenAiResponse>>(openAiUrl, data, { headers })
  const text = response.data?.choices?.[0]?.message?.content || ''
  return text.replace(/^\n+/, '')
}

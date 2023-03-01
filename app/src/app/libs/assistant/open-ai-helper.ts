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

export const fetchFromOpenAI = async (inputText: string, apiKey: string): Promise<string> => {
  const openAiUrl = 'https://api.openai.com/v1/chat/completions'
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + apiKey
  }

  const data = {
    model: 'gpt-3.5-turbo',
    messages: [
      {
        content: inputText,
        role: 'user'
      }
    ]
  }

  const response = await axios.post<any, AxiosResponse<IOpenAiResponse>>(openAiUrl, data, { headers })
  const text = response.data?.choices?.[0]?.message?.content || ''
  return text.replace(/^\n+/, '')
}

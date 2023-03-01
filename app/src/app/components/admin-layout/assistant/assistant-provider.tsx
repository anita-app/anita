import React, { useState, useContext, createContext } from 'react'

interface AssistantContextType {
  queries: Array<string>
  responses: Array<string>
  addQuery: (query: string) => void
  addResponse: (response: string) => void
}

const AssistantContext = createContext<AssistantContextType | null>(null)

export const useAssistant = (): AssistantContextType => {
  const context = useContext(AssistantContext)
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider')
  }
  return context
}

interface IAssistantProviderProps {
  children: React.ReactNode
}

export const AssistantProvider: React.FC<IAssistantProviderProps> = ({ children }) => {
  const [queries, setQueries] = useState<Array<string>>([])
  const [responses, setResponses] = useState<Array<string>>([])

  const addQuery = (query: string) => {
    setQueries([...queries, query])
  }

  const addResponse = (response: string) => {
    setResponses([...responses, response])
  }

  const value = {
    queries,
    responses,
    addQuery,
    addResponse
  }

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  )
}

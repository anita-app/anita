import React, { useState, useContext, createContext } from 'react'

interface AssistantContextType {
  queries: Array<string>
  responses: Array<string>
  setQueries: (queries: Array<string>) => void
  setResponses: (responses: Array<string>) => void
  clear: () => void
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
  const [queries, setQueriesState] = useState<Array<string>>([])
  const [responses, setResponsesState] = useState<Array<string>>([])

  const setQueries = (queries: Array<string>) => {
    setQueriesState([...queries])
  }

  const setResponses = (responses: Array<string>) => {
    setResponsesState([...responses])
  }

  const clear = () => {
    setQueriesState([])
    setResponsesState([])
  }

  const value = {
    queries,
    responses,
    setQueries,
    setResponses,
    clear
  }

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  )
}

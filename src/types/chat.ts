export interface Message {
  id: string
  content: string
  sender: string
  timestamp: Date
  isCurrentUser: boolean
}

export interface Session {
  id: string
  title?: string
  createdAt: string
  messages: {
    id: string
    content: string
    role: 'user' | 'assistant'
    createdAt: string
  }[]
}

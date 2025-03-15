import { getChatCompletion, getChatHistory } from '@/lib/api'
import { Message } from '@/types/chat'
import { useEffect, useState } from 'react'

const INITIAL_MESSAGE: Message = {
  id: '1',
  content: "Hello! I'm your AI assistant. How can I help you today?",
  sender: 'Assistant',
  timestamp: new Date(),
  isCurrentUser: false,
}

export function useChat(initialChatId?: string) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatId, setChatId] = useState<string | undefined>(initialChatId)

  useEffect(() => {
    if (initialChatId) {
      loadChatHistory(initialChatId)
    }
  }, [initialChatId])

  useEffect(() => {
    if (chatId) {
      const url = new URL(window.location.href)
      url.searchParams.set('id', chatId)
      window.history.pushState({}, '', url)
    }
  }, [chatId])

  const loadChatHistory = async (id: string) => {
    try {
      const chat = await getChatHistory(id)
      setChatId(id)
      setMessages(
        chat.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.role === 'user' ? 'You' : 'Assistant',
          timestamp: new Date(msg.createdAt),
          isCurrentUser: msg.role === 'user',
        }))
      )
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'You',
      timestamp: new Date(),
      isCurrentUser: true,
    }

    setMessages((prev) => [...prev, userMessage])
    setNewMessage('')
    setIsLoading(true)

    // Create a placeholder message for the assistant's response
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: '',
      sender: 'Assistant',
      timestamp: new Date(),
      isCurrentUser: false,
    }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      const chatHistory = messages.map((msg) => ({
        role: msg.isCurrentUser ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      }))

      chatHistory.push({ role: 'user' as const, content: newMessage })

      // Handle streaming updates
      const handleChunk = (chunk: string) => {
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage.id === assistantMessageId) {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, content: lastMessage.content + chunk },
            ]
          }
          return prev
        })
      }

      const response = await getChatCompletion(chatHistory, chatId, handleChunk)

      if (!chatId) {
        setChatId(response.chatId)
      }
    } catch (error) {
      console.error('Failed to get AI response:', error)
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1]
        if (lastMessage.id === assistantMessageId) {
          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              content: 'I apologize, but I encountered an error. Please try again later.',
            },
          ]
        }
        return prev
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    sendMessage,
  }
} 
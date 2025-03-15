import { getChatCompletion } from '@/lib/api'
import { Message } from '@/types/chat'
import { useEffect, useState } from 'react'
import { INITIAL_MESSAGE, useChatQuery } from './use-chat-query'

export function useChat(initialChatId?: string) {
  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatId, setChatId] = useState<string | undefined>(initialChatId)

  // Use TanStack Query to fetch chat data
  const { data: chat } = useChatQuery(chatId)
  const messages = chat?.messages ?? localMessages
  
  // Initialize local messages with INITIAL_MESSAGE when no chat data
  useEffect(() => {
    if (!chat?.messages && localMessages.length === 0) {
      setLocalMessages([INITIAL_MESSAGE])
    }
  }, [chat?.messages, localMessages.length])

  // Effect for handling initialChatId changes
  useEffect(() => {
    if (initialChatId) {
      setChatId(initialChatId)
    } else {
      setChatId(undefined)
      setLocalMessages([INITIAL_MESSAGE])
    }
  }, [initialChatId])

  // Effect for URL updates
  useEffect(() => {
    if (chatId) {
      const url = new URL(window.location.href)
      url.searchParams.set('id', chatId)
      window.history.pushState({}, '', url)
    }
  }, [chatId])

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'You',
      timestamp: new Date(),
      isCurrentUser: true,
    }

    setLocalMessages((prev) => [...prev, userMessage])
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
    setLocalMessages((prev) => [...prev, assistantMessage])

    try {
      const chatHistory = messages.map((msg: Message) => ({
        role: msg.isCurrentUser ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      }))

      chatHistory.push({ role: 'user' as const, content: newMessage })

      // Handle streaming updates
      const handleChunk = (chunk: string) => {
        setLocalMessages((prev) => {
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
      setLocalMessages((prev) => {
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
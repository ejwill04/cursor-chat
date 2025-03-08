import { ChatMessage } from '@/components/chat-message'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getChatCompletion, getChatHistory } from '@/lib/api'
import { Message } from '@/types/chat'
import { useEffect, useRef, useState } from 'react'

const INITIAL_MESSAGE: Message = {
  id: '1',
  content: "Hello! I'm your AI assistant. How can I help you today?",
  sender: 'Assistant',
  timestamp: new Date(),
  isCurrentUser: false,
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatId, setChatId] = useState<string>()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load chat history from URL if available
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    if (id) {
      loadChatHistory(id)
    }
  }, [])

  // Update URL when chat ID changes
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

  const focusInput = () => {
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  useEffect(() => {
    focusInput()
  }, [isLoading])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
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

    try {
      const chatHistory = messages.map((msg) => ({
        role: msg.isCurrentUser ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      }))

      chatHistory.push({ role: 'user' as const, content: newMessage })
      const response = await getChatCompletion(chatHistory, chatId)

      // Set chat ID from first response
      if (!chatId) {
        setChatId(response.chatId)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        sender: 'Assistant',
        timestamp: new Date(),
        isCurrentUser: false,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Failed to get AI response:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          'I apologize, but I encountered an error. Please try again later.',
        sender: 'Assistant',
        timestamp: new Date(),
        isCurrentUser: false,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className='flex h-[calc(100vh-2rem)] w-full max-w-[600px] flex-col sm:h-[600px]'>
      <div className='flex-1 overflow-hidden'>
        <ScrollArea className='h-full'>
          <div className='flex flex-col gap-2 p-4'>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} className='h-px' />
          </div>
        </ScrollArea>
      </div>
      <div className='flex gap-2 border-t p-4'>
        <Input
          ref={inputRef}
          className='focus-visible:ring-2'
          placeholder='Type a message...'
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSendMessage()
            }
          }}
          onBlur={focusInput}
          disabled={isLoading}
        />
        <Button onClick={handleSendMessage} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </Card>
  )
}

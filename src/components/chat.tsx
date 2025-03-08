import { Card } from '@/components/ui/card'
import { useChat } from '@/hooks/use-chat'
import { useEffect, useRef } from 'react'
import { ChatInput } from './chat/chat-input'
import { ChatMessages } from './chat/chat-messages'

interface ChatProps {
  initialChatId?: string
}

export function Chat({ initialChatId }: ChatProps) {
  const { messages, newMessage, setNewMessage, isLoading, sendMessage } = useChat(initialChatId)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Card className='flex h-[calc(100vh-4rem)] w-full max-w-[600px] flex-col sm:h-[600px] p-0 border-0'>
      <ChatMessages ref={messagesEndRef} messages={messages} />
      <ChatInput
        ref={inputRef}
        value={newMessage}
        onChange={setNewMessage}
        onSend={sendMessage}
        disabled={isLoading}
        onKeyDown={handleKeyDown}
        onBlur={focusInput}
      />
    </Card>
  )
}

import { ChatMessage } from '@/components/chat-message'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Message } from '@/types/chat'
import { forwardRef } from 'react'

interface ChatMessagesProps {
  messages: Message[]
}

export const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ messages }, ref) => {
    return (
      <div className='flex-1 overflow-hidden'>
        <ScrollArea className='h-full'>
          <div className='flex flex-col gap-2 p-4'>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={ref} className='h-px' />
          </div>
        </ScrollArea>
      </div>
    )
  }
) 
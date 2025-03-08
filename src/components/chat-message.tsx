import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Message } from '@/types/chat'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      className={cn(
        'flex w-full gap-3 p-4',
        message.isCurrentUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <Avatar className='h-8 w-8'>
        <AvatarImage src={`https://avatar.vercel.sh/${message.sender}.png`} />
        <AvatarFallback>{message.sender[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          'flex max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm',
          message.isCurrentUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        <span className='font-semibold'>{message.sender}</span>
        <p>{message.content}</p>
        <span className='text-xs opacity-50'>
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
}

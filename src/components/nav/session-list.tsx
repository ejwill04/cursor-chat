import { Session } from '@/types/chat'
import { Loader2 } from 'lucide-react'
import { ScrollArea } from '../ui/scroll-area'
import { SessionListItem } from './session-list-item'

interface SessionListProps {
  sessions: Session[]
  loading: boolean
  onSelectSession: (id: string) => void
  onDeleteSession: (id: string) => void
}

export function SessionList({
  sessions,
  loading,
  onSelectSession,
  onDeleteSession,
}: SessionListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No chat sessions yet
      </div>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="flex flex-col gap-2">
        {sessions.map((session) => (
          <SessionListItem
            key={session.id}
            id={session.id}
            firstMessage={session.messages[0]?.content || ''}
            createdAt={session.createdAt}
            lastMessageAt={session.messages[session.messages.length - 1]?.createdAt || session.createdAt}
            onSelect={onSelectSession}
            onDelete={onDeleteSession}
          />
        ))}
      </div>
    </ScrollArea>
  )
} 
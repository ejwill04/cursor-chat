import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '../ui/sheet'

interface Session {
  id: string
  createdAt: string
  messages: { content: string; role: 'user' | 'assistant' }[]
}

interface SessionManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SessionManager({ open, onOpenChange }: SessionManagerProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchSessions()
    }
  }, [open])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      console.log('Fetching sessions...')
      const response = await fetch('/api/chats', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      console.log('Response status:', response.status)
      if (!response.ok && response.status !== 304) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch sessions: ${errorText}`)
      }
      const data = await response.json()
      console.log('Fetched sessions:', data)
      setSessions(data)
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewSession = () => {
    // TODO: Implement new session creation
    onOpenChange(false)
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/${sessionId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete session')
      setSessions(sessions.filter((s) => s.id !== sessionId))
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Chat Sessions</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-6">
          <Button onClick={handleNewSession} className="w-full gap-2 px-4 py-6 text-base">
            <Plus className="h-5 w-5" />
            New Session
          </Button>
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="flex flex-col gap-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No chat sessions yet
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {session.messages[0]?.content.slice(0, 30)}...
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
} 
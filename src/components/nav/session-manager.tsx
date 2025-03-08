import { Session } from '@/types/chat'
import { PlusCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet'
import { SessionList } from './session-list'

interface SessionManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNewSession: () => void
  onSelectSession: (sessionId: string) => void
}

export function SessionManager({ open, onOpenChange, onNewSession, onSelectSession }: SessionManagerProps) {
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
      const response = await fetch('/api/chats', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      if (!response.ok && response.status !== 304) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch sessions: ${errorText}`)
      }
      const data = await response.json()
      setSessions(data)
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewSession = () => {
    onNewSession()
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

  const handleSelectSession = (sessionId: string) => {
    onSelectSession(sessionId)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Chat Sessions</SheetTitle>
          <SheetDescription>Manage your chat sessions</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-6">
          <Button onClick={handleNewSession} className="w-full gap-2 px-4 py-6 text-base">
            <PlusCircle className="mr-2 h-5 w-5" />
            New Session
          </Button>
          <SessionList
            sessions={sessions}
            loading={loading}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
} 
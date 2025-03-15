import { Trash2 } from 'lucide-react'
import { Button } from '../ui/button'

interface SessionListItemProps {
  id: string
  title: string
  createdAt: string
  lastMessageAt: string
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export function SessionListItem({
  id,
  title,
  createdAt,
  lastMessageAt,
  onSelect,
  onDelete,
}: SessionListItemProps) {
  return (
    <div
      className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent cursor-pointer"
      onClick={() => onSelect(id)}
    >
      <div className="flex flex-col flex-1 min-w-0 mr-2">
        <span className="font-medium truncate">
          {title || 'New Chat'}
        </span>
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>{new Date(createdAt).toLocaleDateString()}</span>
          <span>{new Date(lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(id)
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
} 
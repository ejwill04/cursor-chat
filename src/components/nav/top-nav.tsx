import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { SessionManager } from './session-manager.tsx'

export function TopNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <SessionManager open={isOpen} onOpenChange={setIsOpen} />
    </nav>
  )
} 
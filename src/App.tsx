import { useState } from 'react'
import { Chat } from './components/chat'
import { TopNav } from './components/nav/top-nav'
import { ThemeProvider } from './components/theme-provider'

export default function App() {
  const [currentChatId, setCurrentChatId] = useState<string | undefined>()

  const handleNewSession = () => {
    setCurrentChatId(undefined)
    // Clear URL params
    window.history.pushState({}, '', window.location.pathname)
  }

  const handleSelectSession = (sessionId: string) => {
    setCurrentChatId(sessionId)
    // Update URL params
    const url = new URL(window.location.href)
    url.searchParams.set('id', sessionId)
    window.history.pushState({}, '', url)
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <TopNav onNewSession={handleNewSession} onSelectSession={handleSelectSession} />
        <main className="flex-1 flex items-center justify-center pt-14">
          <Chat key={currentChatId} initialChatId={currentChatId} />
        </main>
      </div>
    </ThemeProvider>
  )
}

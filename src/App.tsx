import { Chat } from './components/chat'
import { TopNav } from './components/nav/top-nav'
import { ThemeProvider } from './components/theme-provider'

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <TopNav />
        <main className="container mx-auto pt-16">
          <Chat />
        </main>
      </div>
    </ThemeProvider>
  )
}

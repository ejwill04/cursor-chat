import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

// Mock the Chat and TopNav components since we're only testing URL param logic
vi.mock('../components/chat', () => ({
  Chat: ({ initialChatId }: { initialChatId?: string }) => (
    <div data-testid="chat">Chat Component: {initialChatId || 'undefined'}</div>
  ),
}))

vi.mock('../components/nav/top-nav', () => ({
  TopNav: ({ onNewSession, onSelectSession }: { onNewSession: () => void; onSelectSession: (id: string) => void }) => (
    <div data-testid="top-nav">
      <button onClick={onNewSession}>New Session</button>
      <button onClick={() => onSelectSession('test-id')}>Select Session</button>
    </div>
  ),
}))

// Mock ThemeProvider to just render its children
vi.mock('../components/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('App', () => {
  // Reset URL before each test
  beforeEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('should load chat ID from URL search params', async () => {
    // Set up URL with chat ID
    const url = new URL(window.location.href)
    url.searchParams.set('id', 'test-chat-id')
    window.history.pushState({}, '', url)

    render(<App />)

    // Check if Chat component received the correct ID
    await waitFor(() => {
      expect(screen.getByTestId('chat')).toHaveTextContent('Chat Component: test-chat-id')
    })
  })

  it('should clear URL params when creating new session', async () => {
    // Set up initial URL with chat ID
    const url = new URL(window.location.href)
    url.searchParams.set('id', 'test-chat-id')
    window.history.pushState({}, '', url)

    render(<App />)

    // Click new session button
    await act(async () => {
      screen.getByText('New Session').click()
    })

    // Check if URL params are cleared
    await waitFor(() => {
      expect(window.location.search).toBe('')
      expect(screen.getByTestId('chat')).toHaveTextContent('Chat Component: undefined')
    })
  })

  it('should update URL params when selecting a session', async () => {
    render(<App />)

    // Click select session button
    await act(async () => {
      screen.getByText('Select Session').click()
    })

    // Check if URL params are updated
    await waitFor(() => {
      const searchParams = new URLSearchParams(window.location.search)
      expect(searchParams.get('id')).toBe('test-id')
      expect(screen.getByTestId('chat')).toHaveTextContent('Chat Component: test-id')
    })
  })

  it('should render without chat ID when no URL params present', async () => {
    // Clear URL params
    window.history.pushState({}, '', window.location.pathname)

    render(<App />)

    // Check if Chat component received undefined
    await waitFor(() => {
      expect(screen.getByTestId('chat')).toHaveTextContent('Chat Component: undefined')
    })
  })
}) 
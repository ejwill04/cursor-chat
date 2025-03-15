import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SessionList } from '../components/nav/session-list'
import type { Session } from '../types/chat'

describe('SessionList', () => {
  const mockSessions: Session[] = [
    {
      id: '1',
      title: 'First Chat',
      createdAt: '2024-03-15T10:00:00Z',
      messages: [
        {
          id: 'm1',
          content: 'Hello',
          role: 'user',
          createdAt: '2024-03-15T10:00:00Z'
        }
      ]
    },
    {
      id: '2',
      title: undefined,
      createdAt: '2024-03-15T11:00:00Z',
      messages: [
        {
          id: 'm2',
          content: 'Second chat message',
          role: 'user',
          createdAt: '2024-03-15T11:00:00Z'
        }
      ]
    }
  ]

  const mockProps = {
    sessions: mockSessions,
    loading: false,
    onSelectSession: vi.fn(),
    onDeleteSession: vi.fn()
  }

  it('should display session titles', () => {
    render(<SessionList {...mockProps} />)
    expect(screen.getByText('First Chat')).toBeInTheDocument()
    expect(screen.getByText('Second chat message')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    render(<SessionList {...mockProps} loading={true} />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('should show empty state when no sessions', () => {
    render(<SessionList {...mockProps} sessions={[]} />)
    expect(screen.getByText('No chat sessions yet')).toBeInTheDocument()
  })

  it('should fallback to first message when title is undefined', () => {
    render(<SessionList {...mockProps} />)
    const secondSession = screen.getByText('Second chat message')
    expect(secondSession).toBeInTheDocument()
  })
}) 
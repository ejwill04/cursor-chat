import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SessionListItem } from '../components/nav/session-list-item'

describe('SessionListItem', () => {
  const mockProps = {
    id: '1',
    title: 'Test Chat',
    createdAt: '2024-03-15T10:00:00Z',
    lastMessageAt: '2024-03-15T11:00:00Z',
    onSelect: vi.fn(),
    onDelete: vi.fn(),
  }

  it('should display the chat title', () => {
    render(<SessionListItem {...mockProps} />)
    expect(screen.getByText('Test Chat')).toBeInTheDocument()
  })

  it('should display "New Chat" when title is empty', () => {
    render(<SessionListItem {...mockProps} title="" />)
    expect(screen.getByText('New Chat')).toBeInTheDocument()
  })

  it('should call onSelect when clicked', () => {
    render(<SessionListItem {...mockProps} />)
    fireEvent.click(screen.getByText('Test Chat'))
    expect(mockProps.onSelect).toHaveBeenCalledWith('1')
  })

  it('should call onDelete when delete button is clicked', () => {
    render(<SessionListItem {...mockProps} />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockProps.onDelete).toHaveBeenCalledWith('1')
  })

  it('should format dates correctly', () => {
    render(<SessionListItem {...mockProps} />)
    expect(screen.getByText('3/15/2024')).toBeInTheDocument()
  })
}) 
import { useChat } from '@/hooks/use-chat'
import { getChatHistory } from '@/lib/api'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the API calls
vi.mock('@/lib/api', () => ({
  getChatHistory: vi.fn(),
  getChatCompletion: vi.fn(),
}))

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.history.pushState
    window.history.pushState = vi.fn()
  })

  it('should return expected object shape', () => {
    const { result } = renderHook(() => useChat())
    
    expect(result.current).toHaveProperty('messages')
    expect(result.current).toHaveProperty('newMessage')
    expect(result.current).toHaveProperty('setNewMessage')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('sendMessage')
    expect(Array.isArray(result.current.messages)).toBe(true)
  })

  it('should load chat history only once when initialChatId is provided', async () => {
    // Mock chat history response
    const mockChat = {
      id: 'test-id',
      messages: [
        {
          id: '1',
          content: 'Test message',
          role: 'user',
          createdAt: new Date().toISOString(),
        },
      ],
    }
    vi.mocked(getChatHistory).mockResolvedValue(mockChat)

    // Render hook with initial chat ID
    const { result, rerender } = renderHook(() => useChat('test-id'))

    // Wait for chat history to load
    await waitFor(() => {
      expect(result.current.messages.length).toBe(1)
    })

    // Force a rerender
    rerender()

    // Wait a bit to ensure no additional calls
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verify getChatHistory was called exactly once
    expect(getChatHistory).toHaveBeenCalledTimes(1)
    expect(getChatHistory).toHaveBeenCalledWith('test-id')

    // Verify URL was updated exactly once
    expect(window.history.pushState).toHaveBeenCalledTimes(1)
  })

  it('should not load chat history when no initialChatId is provided', () => {
    renderHook(() => useChat())

    // Verify getChatHistory was not called
    expect(getChatHistory).not.toHaveBeenCalled()
    expect(window.history.pushState).not.toHaveBeenCalled()
  })

  it('should not trigger multiple API calls when chatId is set to the same value', async () => {
    // Mock chat history response
    const mockChat = {
      id: 'test-id',
      messages: [
        {
          id: '1',
          content: 'Test message',
          role: 'user',
          createdAt: new Date().toISOString(),
        },
      ],
    }
    vi.mocked(getChatHistory).mockResolvedValue(mockChat)

    // Render hook with initial chat ID
    const { rerender } = renderHook((id) => useChat(id), {
      initialProps: 'test-id',
    })

    // Wait for initial load
    await waitFor(() => {
      expect(getChatHistory).toHaveBeenCalledTimes(1)
    })

    // Rerender with same ID multiple times
    rerender('test-id')
    rerender('test-id')

    // Wait a bit to ensure no additional calls
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verify getChatHistory wasn't called again
    expect(getChatHistory).toHaveBeenCalledTimes(1)
    expect(window.history.pushState).toHaveBeenCalledTimes(1)
  })

  it('should update URL when chatId changes without triggering new API calls', async () => {
    // Mock chat history response
    const mockChat = {
      id: 'test-id',
      messages: [
        {
          id: '1',
          content: 'Test message',
          role: 'user',
          createdAt: new Date().toISOString(),
        },
      ],
    }
    vi.mocked(getChatHistory).mockResolvedValue(mockChat)

    // Render hook with initial chat ID
    const { rerender } = renderHook((id) => useChat(id), {
      initialProps: 'test-id-1',
    })

    // Wait for initial load
    await waitFor(() => {
      expect(getChatHistory).toHaveBeenCalledTimes(1)
    })

    // Rerender with different ID
    rerender('test-id-2')

    // Wait for URL update
    await waitFor(() => {
      expect(window.history.pushState).toHaveBeenCalledTimes(2)
    })

    // Verify only one API call was made despite URL updates
    expect(getChatHistory).toHaveBeenCalledTimes(2)
  })
}) 
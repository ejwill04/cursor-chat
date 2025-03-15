import { useChat } from '@/hooks/use-chat'
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('useChat', () => {
  it('should return expected object shape', () => {
    const { result } = renderHook(() => useChat())
    
    expect(result.current).toHaveProperty('messages')
    expect(result.current).toHaveProperty('newMessage')
    expect(result.current).toHaveProperty('setNewMessage')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('sendMessage')
    expect(Array.isArray(result.current.messages)).toBe(true)
  })
}) 
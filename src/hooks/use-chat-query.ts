import { getChatHistory } from '@/lib/api'
import { Message } from '@/types/chat'
import { useQuery } from '@tanstack/react-query'

export function useChatQuery(chatId?: string) {
  return useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      if (!chatId) return null
      const chat = await getChatHistory(chatId)
      return {
        ...chat,
        messages: chat.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.role === 'user' ? 'You' : 'Assistant',
          timestamp: new Date(msg.createdAt),
          isCurrentUser: msg.role === 'user',
        })),
      }
    },
    enabled: !!chatId, // Only run query if chatId exists
  })
}

// Initial message shown when no chat is loaded
export const INITIAL_MESSAGE: Message = {
  id: '1',
  content: "Hello! I'm your AI assistant. How can I help you today?",
  sender: 'Assistant',
  timestamp: new Date(),
  isCurrentUser: false,
} 
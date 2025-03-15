const API_URL = 'http://localhost:3000/api'

type ChatResponse = {
  chatId?: string
  content?: string
  error?: string
  done?: boolean
}

export async function getChatCompletion(
  messages: { role: 'user' | 'assistant'; content: string }[],
  chatId?: string,
  onChunk?: (chunk: string) => void
): Promise<{ chatId: string; content: string }> {
  try {
    const url = chatId ? `${API_URL}/chat/${chatId}` : `${API_URL}/chat`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    })

    if (!response.ok) {
      throw new Error('Failed to get chat completion')
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    let chatIdFromStream: string | undefined
    let fullContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      // Convert the chunk to text
      const chunk = new TextDecoder().decode(value)
      const lines = chunk.split('\n')

      // Process each SSE line
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data: ChatResponse = JSON.parse(line.slice(6))
            
            if (data.error) {
              throw new Error(data.error)
            }

            if (data.content) {
              fullContent += data.content
              onChunk?.(data.content)
            }

            if (data.chatId) {
              chatIdFromStream = data.chatId
            }

            if (data.done) {
              // Stream is complete
              return {
                chatId: chatIdFromStream || chatId || '',
                content: fullContent,
              }
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e)
          }
        }
      }
    }

    throw new Error('Stream ended without completion')
  } catch (error) {
    console.error('Error getting chat completion:', error)
    throw error
  }
}

export async function getChatHistory(chatId: string) {
  try {
    const response = await fetch(`${API_URL}/chat/${chatId}`)

    if (!response.ok) {
      throw new Error('Failed to get chat history')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error getting chat history:', error)
    throw error
  }
} 
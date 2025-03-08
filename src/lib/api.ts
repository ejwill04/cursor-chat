const API_URL = 'http://localhost:3000/api'

type ChatResponse = {
  chatId: string
  content: string
}

export async function getChatCompletion(
  messages: { role: 'user' | 'assistant'; content: string }[],
  chatId?: string
) {
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

    const data: ChatResponse = await response.json()
    return data
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
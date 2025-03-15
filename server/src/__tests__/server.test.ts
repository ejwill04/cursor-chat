import { Express } from 'express'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createServer } from '../server'
import { addMessageToChat, createChat, getChatHistory, prisma } from '../services/db'

// Mock console methods
const originalConsoleLog = console.log
const originalConsoleError = console.error

beforeEach(() => {
  console.log = vi.fn()
  console.error = vi.fn()
})

afterEach(() => {
  console.log = originalConsoleLog
  console.error = originalConsoleError
})

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockImplementation(async () => ({
            [Symbol.asyncIterator]: async function* () {
              yield { choices: [{ delta: { content: 'Hello!' } }] }
              yield { choices: [{ delta: { content: ' How are you?' } }] }
            }
          }))
        }
      }
    }))
  }
})

// Mock database services
vi.mock('../services/db', () => ({
  prisma: {
    chat: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
    message: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
  createChat: vi.fn(),
  addMessageToChat: vi.fn(),
  getChatHistory: vi.fn(),
}))

describe('Server', () => {
  let app: Express

  beforeEach(() => {
    app = createServer()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /health', () => {
    it('should return ok status', async () => {
      const response = await request(app)
        .get('/health')
        .set('Accept', 'application/json')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: 'ok' })
    })
  })

  describe('POST /api/chat', () => {
    it('should create a new chat and stream response', async () => {
      const mockMessages = [{ role: 'user' as const, content: 'Hello' }]
      const mockChat = {
        id: '123',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [{
          id: '1',
          content: 'Hello',
          role: 'user',
          chatId: '123',
          createdAt: new Date()
        }]
      }

      // Mock the database response
      vi.mocked(createChat).mockResolvedValue(mockChat)

      // Make the request and collect the response chunks
      const chunks: Buffer[] = []
      await new Promise<void>((resolve, reject) => {
        request(app)
          .post('/api/chat')
          .send({ messages: mockMessages })
          .set('Accept', 'text/event-stream')
          .buffer(true)
          .parse((res, callback) => {
            res.on('data', (chunk: Buffer) => {
              chunks.push(chunk)
            })
            res.on('end', () => {
              callback(null, Buffer.concat(chunks))
              resolve()
            })
            res.on('error', reject)
          })
          .end((err) => {
            if (err) reject(err)
          })
      })

      // Convert chunks to string and parse SSE format
      const responseText = Buffer.concat(chunks).toString('utf-8')
      const events = responseText
        .split('\n\n')
        .filter(Boolean)
        .map(event => {
          const data = event.replace('data: ', '')
          try {
            return JSON.parse(data)
          } catch {
            return null
          }
        })
        .filter(Boolean)

      // Verify the response
      expect(events[0]).toEqual({ content: 'Hello!' })
      expect(events[1]).toEqual({ content: ' How are you?' })
      expect(events[2]).toEqual({ chatId: mockChat.id, done: true })

      // Verify database interactions
      expect(createChat).toHaveBeenCalledWith(mockMessages)
    })

    it('should handle database errors gracefully', async () => {
      const mockMessages = [{ role: 'user' as const, content: 'Hello' }]
      
      // Mock database error
      vi.mocked(createChat).mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .post('/api/chat')
        .send({ messages: mockMessages })
        .set('Accept', 'text/event-stream')

      expect(response.status).toBe(200) // SSE connections always return 200
      expect(response.text).toContain('Failed to get chat completion')
    })
  })

  describe('POST /api/chat/:chatId', () => {
    it('should continue existing chat and stream response', async () => {
      const chatId = '123'
      const mockMessages = [{ role: 'user' as const, content: 'Hello again' }]

      // Mock database response
      vi.mocked(addMessageToChat).mockResolvedValue({
        id: '2',
        content: 'Hello again',
        role: 'user',
        chatId,
        createdAt: new Date()
      })

      // Make the request and collect the response chunks
      const chunks: Buffer[] = []
      await new Promise<void>((resolve, reject) => {
        request(app)
          .post(`/api/chat/${chatId}`)
          .send({ messages: mockMessages })
          .set('Accept', 'text/event-stream')
          .buffer(true)
          .parse((res, callback) => {
            res.on('data', (chunk: Buffer) => {
              chunks.push(chunk)
            })
            res.on('end', () => {
              callback(null, Buffer.concat(chunks))
              resolve()
            })
            res.on('error', reject)
          })
          .end((err) => {
            if (err) reject(err)
          })
      })

      // Parse and verify the response
      const responseText = Buffer.concat(chunks).toString('utf-8')
      const events = responseText
        .split('\n\n')
        .filter(Boolean)
        .map(event => {
          const data = event.replace('data: ', '')
          try {
            return JSON.parse(data)
          } catch {
            return null
          }
        })
        .filter(Boolean)

      expect(events[0]).toEqual({ content: 'Hello!' })
      expect(events[1]).toEqual({ content: ' How are you?' })
      expect(events[2]).toEqual({ done: true })
      expect(addMessageToChat).toHaveBeenCalledWith(chatId, mockMessages[0])
    })
  })

  describe('GET /api/chat/:chatId', () => {
    it('should return chat history', async () => {
      const now = new Date()
      const mockChat = {
        id: '123',
        messages: [
          {
            id: '1',
            content: 'Hello',
            role: 'user',
            chatId: '123',
            createdAt: now,
          },
          {
            id: '2',
            content: 'Hi there!',
            role: 'assistant',
            chatId: '123',
            createdAt: now,
          }
        ],
        createdAt: now,
        updatedAt: now,
      }

      vi.mocked(getChatHistory).mockResolvedValue(mockChat)

      const response = await request(app)
        .get(`/api/chat/${mockChat.id}`)
        .set('Accept', 'application/json')

      expect(response.status).toBe(200)
      
      const expectedResponse = {
        ...mockChat,
        createdAt: mockChat.createdAt.toISOString(),
        updatedAt: mockChat.updatedAt.toISOString(),
        messages: mockChat.messages.map(msg => ({
          ...msg,
          createdAt: msg.createdAt.toISOString()
        }))
      }
      
      expect(response.body).toEqual(expectedResponse)
      expect(getChatHistory).toHaveBeenCalledWith(mockChat.id)
    })

    it('should return 404 for non-existent chat', async () => {
      vi.mocked(getChatHistory).mockResolvedValue(null)

      const response = await request(app)
        .get('/api/chat/nonexistent')
        .set('Accept', 'application/json')

      expect(response.status).toBe(404)
      expect(getChatHistory).toHaveBeenCalledWith('nonexistent')
    })

    it('should handle database errors', async () => {
      vi.mocked(getChatHistory).mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .get('/api/chat/123')
        .set('Accept', 'application/json')

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: 'Failed to get chat history' })
    })
  })

  describe('GET /api/chats', () => {
    it('should list all chats', async () => {
      const now = new Date()
      const mockChats = [
        {
          id: '123',
          messages: [
            {
              id: '1',
              content: 'Hello',
              role: 'user',
              chatId: '123',
              createdAt: now,
            }
          ],
          createdAt: now,
          updatedAt: now,
        }
      ]

      vi.mocked(prisma.chat.findMany).mockResolvedValue(mockChats)

      const response = await request(app)
        .get('/api/chats')
        .set('Accept', 'application/json')

      expect(response.status).toBe(200)
      
      const expectedResponse = mockChats.map(chat => ({
        ...chat,
        createdAt: chat.createdAt.toISOString(),
        updatedAt: chat.updatedAt.toISOString(),
        messages: chat.messages.map(msg => ({
          ...msg,
          createdAt: msg.createdAt.toISOString()
        }))
      }))
      
      expect(response.body).toEqual(expectedResponse)
    })

    it('should handle database errors when listing chats', async () => {
      vi.mocked(prisma.chat.findMany).mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .get('/api/chats')
        .set('Accept', 'application/json')

      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: 'Failed to list chats' })
    })
  })

  describe('DELETE /api/chat/:chatId', () => {
    it('should delete a chat and its messages', async () => {
      const chatId = '123'

      vi.mocked(prisma.message.deleteMany).mockResolvedValue({ count: 2 })
      vi.mocked(prisma.chat.delete).mockResolvedValue({
        id: chatId,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const response = await request(app)
        .delete(`/api/chat/${chatId}`)
        .set('Accept', 'application/json')

      expect(response.status).toBe(204)
      expect(prisma.message.deleteMany).toHaveBeenCalledWith({
        where: { chatId }
      })
      expect(prisma.chat.delete).toHaveBeenCalledWith({
        where: { id: chatId }
      })
      
      // Verify logging
      expect(console.log).toHaveBeenCalledWith('Deleting chat:', chatId)
      expect(console.log).toHaveBeenCalledWith('Successfully deleted chat:', chatId)
    })

    it('should handle database errors when deleting', async () => {
      vi.mocked(prisma.message.deleteMany).mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .delete('/api/chat/123')
        .set('Accept', 'application/json')

      expect(response.status).toBe(500)
      expect(response.body).toEqual({
        error: 'Failed to delete chat',
        details: 'Database error'
      })
      
      // Verify logging
      expect(console.log).toHaveBeenCalledWith('Deleting chat:', '123')
      expect(console.error).toHaveBeenCalledWith('Error deleting chat:', expect.any(Error))
    })
  })
}) 
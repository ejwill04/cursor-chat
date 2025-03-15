import { PrismaClient } from '@prisma/client'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { createChat, getChatHistory } from '../services/db'

const prisma = new PrismaClient()

describe('Database Service', () => {
  beforeEach(async () => {
    // Clear the database before each test
    await prisma.message.deleteMany()
    await prisma.chat.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('createChat', () => {
    it('should create a chat with title from first user message', async () => {
      const messages = [
        { role: 'user' as const, content: 'Hello, this is a test' },
        { role: 'assistant' as const, content: 'Hi there!' }
      ]

      const chat = await createChat(messages)

      expect(chat).toBeDefined()
      expect(chat.title).toBe('Hello, this is a test')
      expect(chat.messages).toHaveLength(2)
      expect(chat.messages[0].content).toBe('Hello, this is a test')
      expect(chat.messages[0].role).toBe('user')
    })

    it('should truncate long titles to 50 characters', async () => {
      const longMessage = 'This is a very long message that should be truncated because it exceeds fifty characters'
      const messages = [
        { role: 'user' as const, content: longMessage }
      ]

      const chat = await createChat(messages)

      expect(chat.title).toBe(longMessage.slice(0, 50))
    })

    it('should use "New Chat" as title when no user message exists', async () => {
      const messages = [
        { role: 'assistant' as const, content: 'Welcome!' }
      ]

      const chat = await createChat(messages)

      expect(chat.title).toBe('New Chat')
    })
  })

  describe('getChatHistory', () => {
    it('should retrieve chat with title and messages', async () => {
      // Create a chat first
      const messages = [
        { role: 'user' as const, content: 'Test message' }
      ]
      const createdChat = await createChat(messages)

      // Retrieve the chat
      const chat = await getChatHistory(createdChat.id)

      expect(chat).toBeDefined()
      expect(chat?.title).toBe('Test message')
      expect(chat?.messages).toHaveLength(1)
    })
  })
}) 
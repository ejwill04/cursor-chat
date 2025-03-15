import cors from 'cors'
import dotenv from 'dotenv'
import express, { Express } from 'express'
import OpenAI from 'openai'
import { addMessageToChat, createChat, getChatHistory, prisma } from './services/db'
import { ChatRequest } from './types/chat'

// Load environment variables
dotenv.config()

export function createServer(): Express {
  const app = express()

  // Initialize OpenAI
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'test-key',
  })

  // Middleware
  app.use(express.json())
  app.use(cors())

  // Health check endpoint
  app.get('/health', (_, res) => {
    res.json({ status: 'ok' })
  })

  // Create new chat
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages } = req.body as ChatRequest
      const chat = await createChat(messages)

      // Set up SSE headers
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      const stream = await openai.chat.completions.create({
        messages,
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        stream: true,
      })

      let fullContent = ''

      // Stream the response
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          fullContent += content
          res.write(`data: ${JSON.stringify({ content })}\n\n`)
        }
      }

      // Save the complete message
      const assistantMessage = {
        role: 'assistant' as const,
        content: fullContent,
      }

      await addMessageToChat(chat.id, assistantMessage)

      // End the stream with the chat ID
      res.write(`data: ${JSON.stringify({ chatId: chat.id, done: true })}\n\n`)
      res.end()
    } catch (error) {
      console.error('Error in chat completion:', error)
      res.write(`data: ${JSON.stringify({ error: 'Failed to get chat completion' })}\n\n`)
      res.end()
    }
  })

  // Continue chat
  app.post('/api/chat/:chatId', async (req, res) => {
    try {
      const { chatId } = req.params
      const { messages } = req.body as ChatRequest

      const lastMessage = messages[messages.length - 1]
      await addMessageToChat(chatId, lastMessage)

      // Set up SSE headers
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      const stream = await openai.chat.completions.create({
        messages,
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        stream: true,
      })

      let fullContent = ''

      // Stream the response
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          fullContent += content
          res.write(`data: ${JSON.stringify({ content })}\n\n`)
        }
      }

      // Save the complete message
      const assistantMessage = {
        role: 'assistant' as const,
        content: fullContent,
      }

      await addMessageToChat(chatId, assistantMessage)

      // End the stream
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
      res.end()
    } catch (error) {
      console.error('Error in chat completion:', error)
      res.write(`data: ${JSON.stringify({ error: 'Failed to get chat completion' })}\n\n`)
      res.end()
    }
  })

  // Get chat history
  app.get('/api/chat/:chatId', async (req, res) => {
    try {
      const { chatId } = req.params
      const chat = await getChatHistory(chatId)

      if (!chat) {
        res.status(404).json({ error: 'Chat not found' })
        return
      }

      res.json(chat)
    } catch (error) {
      console.error('Error getting chat history:', error)
      res.status(500).json({ error: 'Failed to get chat history' })
    }
  })

  // List all chats
  app.get('/api/chats', async (req, res) => {
    try {
      console.log('Fetching all chats...')
      const chats = await prisma.chat.findMany({
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      console.log('Found chats:', chats)
      res.json(chats)
    } catch (error) {
      console.error('Error listing chats:', error)
      res.status(500).json({ error: 'Failed to list chats' })
    }
  })

  // Delete chat
  app.delete('/api/chat/:chatId', async (req, res) => {
    try {
      const { chatId } = req.params
      console.log('Deleting chat:', chatId)
      
      // Delete all messages first
      await prisma.message.deleteMany({
        where: { chatId },
      })
      
      // Then delete the chat
      await prisma.chat.delete({
        where: { id: chatId },
      })
      
      console.log('Successfully deleted chat:', chatId)
      res.status(204).end()
    } catch (error) {
      console.error('Error deleting chat:', error)
      res.status(500).json({ error: 'Failed to delete chat', details: error instanceof Error ? error.message : String(error) })
    }
  })

  return app
}

// Only start the server if this file is run directly
if (require.main === module) {
  // Validate environment variables
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_api_key_here') {
    console.error('\x1b[31mError: OPENAI_API_KEY is not set in .env file\x1b[0m')
    console.error('Please add your OpenAI API key to server/.env:')
    console.error('OPENAI_API_KEY=your-actual-api-key')
    console.error('You can get your API key from https://platform.openai.com/api-keys')
    process.exit(1)
  }

  const port = process.env.PORT || 3000
  const app = createServer()
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  })
} 
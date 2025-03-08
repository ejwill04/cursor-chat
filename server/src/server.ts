import cors from 'cors'
import dotenv from 'dotenv'
import express, { RequestHandler } from 'express'
import OpenAI from 'openai'
import { addMessageToChat, createChat, getChatHistory, prisma } from './services/db'
import { ChatRequest } from './types/chat'

// Load environment variables
dotenv.config()

// Validate environment variables
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_api_key_here') {
  console.error('\x1b[31mError: OPENAI_API_KEY is not set in .env file\x1b[0m')
  console.error('Please add your OpenAI API key to server/.env:')
  console.error('OPENAI_API_KEY=your-actual-api-key')
  console.error('You can get your API key from https://platform.openai.com/api-keys')
  process.exit(1)
}

const app = express()
const port = process.env.PORT || 3000

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Middleware
app.use(express.json())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE'],
  })
)

// Create new chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body as ChatRequest
    const chat = await createChat(messages)

    const completion = await openai.chat.completions.create({
      messages,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    })

    const assistantMessage = {
      role: 'assistant' as const,
      content: completion.choices[0].message.content || '',
    }

    await addMessageToChat(chat.id, assistantMessage)

    res.json({
      chatId: chat.id,
      content: assistantMessage.content,
    })
  } catch (error) {
    console.error('Error in chat completion:', error)
    res.status(500).json({ error: 'Failed to get chat completion' })
  }
})

// Continue chat
app.post('/api/chat/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params
    const { messages } = req.body as ChatRequest

    const lastMessage = messages[messages.length - 1]
    await addMessageToChat(chatId, lastMessage)

    const completion = await openai.chat.completions.create({
      messages,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    })

    const assistantMessage = {
      role: 'assistant' as const,
      content: completion.choices[0].message.content || '',
    }

    await addMessageToChat(chatId, assistantMessage)

    res.json({
      chatId,
      content: assistantMessage.content,
    })
  } catch (error) {
    console.error('Error in chat completion:', error)
    res.status(500).json({ error: 'Failed to get chat completion' })
  }
})

// Get chat history
const getChatHistoryHandler: RequestHandler = async (req, res) => {
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
}

app.get('/api/chat/:chatId', getChatHistoryHandler)

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

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
}) 
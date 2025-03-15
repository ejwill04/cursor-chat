import { PrismaClient } from '@prisma/client'
import type { ChatMessage } from '../types/chat'

export const prisma = new PrismaClient()

export async function createChat(messages: ChatMessage[]) {
  // Find the first user message to use as the title
  const firstUserMessage = messages.find(msg => msg.role === 'user')
  const title = firstUserMessage?.content || 'New Chat'

  return prisma.chat.create({
    data: {
      title: title.slice(0, 50), // Limit title length to 50 characters
      messages: {
        create: messages.map((msg) => ({
          content: msg.content,
          role: msg.role,
        })),
      },
    },
    include: {
      messages: true,
    },
  })
}

export async function addMessageToChat(chatId: string, message: ChatMessage) {
  return prisma.message.create({
    data: {
      content: message.content,
      role: message.role,
      chatId,
    },
  })
}

export async function getChatHistory(chatId: string) {
  return prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })
} 